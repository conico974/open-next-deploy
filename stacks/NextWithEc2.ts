import path from "path";
import { DistribOrigin } from "./core/BaseNextAWS";
import { BaseNextWithCloudfront } from "./core/BaseNextWithCloudfront";
import { OpenNextS3Origin, OpenNextServerFunctionOrigin } from "./core/types";

export class NextWithEc2AndCloudfront extends BaseNextWithCloudfront {
  private securityGroup?: aws.ec2.SecurityGroup;

  constructor(
    private publicKey: sst.Secret,
    private privateKey: sst.Secret,
  ) {
    super("ec2", "eu-west-1", "open-next/ec2.ts");
    this.createOriginsAndDistribution();
  }

  private createEC2Origin(originKey: string): DistribOrigin {
    const publicKey = this.publicKey.value;
    const privateKey = this.privateKey.value;
    const ec2Output = this.openNextOutput.origins[
      originKey
    ] as OpenNextServerFunctionOrigin;

    if (!this.securityGroup) {
      this.securityGroup = new aws.ec2.SecurityGroup(`ec2SecGrp`, {
        description: "Next Server",
        ingress: [
          {
            protocol: "tcp",
            fromPort: 22,
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"],
          },
          {
            protocol: "tcp",
            fromPort: 3000,
            toPort: 3000,
            cidrBlocks: ["0.0.0.0/0"],
          },
        ],
        egress: [
          {
            cidrBlocks: ["0.0.0.0/0"],
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
          },
        ],
      });
    }

    const amiId = aws.ec2
      .getAmi(
        {
          owners: ["amazon"],
          mostRecent: true,
          filters: [
            {
              name: "name",
              values: ["al2023-ami-*-x86_64"],
            },
          ],
        },
        { async: true },
      )
      .then((ami) => ami.id);

    const key = new aws.ec2.KeyPair(`ec2KeyPair`, { publicKey: publicKey });

    const role = new aws.iam.Role(`ec2Role`, {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "ec2.amazonaws.com",
      }),
    });

    const policy = new aws.iam.RolePolicy(`ec2Policy`, {
      role: role.id,
      policy: {
        Version: "2012-10-17",
        Statement: this.getPolicyStatement(),
      },
    });

    const instanceProfile = new aws.iam.InstanceProfile(`ec2InstanceProfile`, {
      role: role.name,
    });

    const server = new aws.ec2.Instance(`ec2Instance`, {
      instanceType: "t3.micro",
      ami: amiId,
      keyName: key.keyName,
      vpcSecurityGroupIds: [this.securityGroup.id],
      userData: `#!/bin/bash
      sudo yum update -y
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
      source ~/.bashrc
      nvm install 20
      npm install pm2@latest -g
      `,
      iamInstanceProfile: instanceProfile.name,
    });

    const connection: command.types.input.remote.ConnectionArgs = {
      host: server.publicIp,
      user: "ec2-user",
      privateKey,
    };

    // We use random here so that it re-copies the files on every deploy
    // In a real-world scenario, you would want to use a hash of the files
    const random = Math.random();

    const copyFiles = new command.remote.CopyToRemote(
      "copyFiles",
      {
        connection,
        source: new $util.asset.FileArchive(path.resolve(ec2Output.bundle)),
        remotePath: "/home/ec2-user/server",
        triggers: [random],
      },
      { dependsOn: server },
    );
    console.log("file copied");

    const {
      CACHE_BUCKET_NAME,
      BUCKET_NAME,
      REVALIDATION_QUEUE_URL,
      CACHE_DYNAMO_TABLE,
      ...rest
    } = this.getEnvironment();

    const stringEnvSet = $util
      .all([
        CACHE_BUCKET_NAME,
        REVALIDATION_QUEUE_URL,
        CACHE_DYNAMO_TABLE,
        BUCKET_NAME,
      ])
      .apply(
        ([
          cacheBucketName,
          revalidationQueueUrl,
          cacheDynamoTable,
          bucketName,
        ]) => {
          return `CACHE_BUCKET_NAME=${cacheBucketName} CACHE_BUCKET_KEY_PREFIX=${rest.CACHE_BUCKET_KEY_PREFIX} CACHE_BUCKET_REGION=${this.region} REVALIDATION_QUEUE_URL=${revalidationQueueUrl} REVALIDATION_QUEUE_REGION=${this.region} CACHE_DYNAMO_TABLE=${cacheDynamoTable} BUCKET_NAME=${bucketName} BUCKET_KEY_PREFIX=${rest.BUCKET_KEY_PREFIX}`;
        },
      );

    const launchServer = new command.remote.Command(
      "launchServer",
      {
        connection,
        create: stringEnvSet.apply((env) => {
          return `${env} pm2 start /home/ec2-user/server/${originKey}/index.mjs --name next
      `;
        }),
        update: stringEnvSet.apply((env) => `${env} pm2 restart next`),
      },
      { dependsOn: copyFiles },
    );

    return {
      originId: originKey,
      type: "function",
      domainName: server.publicDns.apply((url) => {
        console.log("EC2 origin", url);
        return url;
      }),
      useHttp: true,
      httpPort: 3000,
    };
  }

  createOrigins(): Record<string, DistribOrigin> {
    const origins: [string, DistribOrigin][] = Object.entries(
      this.openNextOutput.origins,
    ).map(([key, value]) => {
      if (key === "s3") {
        value = value as OpenNextS3Origin;
        return [key, this.createS3Origin(key)];
      } else if (value.type === "function" && value.wrapper === "node") {
        return [key, this.createEC2Origin(key)];
      }
      return [key, this.createLambdaOrigin(key)];
    });
    return Object.fromEntries(origins);
  }
}
