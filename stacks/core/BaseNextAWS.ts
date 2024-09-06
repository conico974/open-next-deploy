import { execSync } from "node:child_process";
import {
  OpenNextOutput,
  OpenNextS3Origin,
  OpenNextServerFunctionOrigin,
} from "./types";
import path from "node:path";
import { readFileSync, existsSync, copyFileSync, writeFileSync } from "node:fs";

export type DistribOrigin =
  | {
      type: "s3";
      originId: string;
      domainName: $util.Output<string>;
      originPath: string;
    }
  | {
      type: "function";
      originId: string;
      domainName: $util.Output<string>;
      useHttp?: boolean;
      httpPort?: number;
    };

export abstract class BaseNextAWS<Distribution> {
  protected openNextOutput: OpenNextOutput;
  protected bucket: sst.aws.Bucket;
  protected table: aws.dynamodb.Table;
  protected queue: sst.aws.Queue;
  protected origins: Record<string, DistribOrigin>;
  protected distribution: Distribution;
  private ecrRepository?: awsx.ecr.Repository;

  constructor(
    public name: string,
    public region: string,
    public configPath?: string,
  ) {
    if (!this.configPath) {
      this.configPath = "open-next.config.ts";
    }
    this.openNextOutput = this.buildApp();
    this.bucket = this.createBucketAndUpload();

    const { queue, table } = this.createRevalidationStack();
    this.queue = queue;
    this.table = table;
  }

  /**
   * This method needs to be called in the constructor of the child class
   */
  protected createOriginsAndDistribution() {
    this.origins = this.createOrigins();
    this.distribution = this.createDistribution();
  }

  abstract createOrigins(): Record<string, DistribOrigin>;

  abstract createDistribution(): Distribution;

  protected getFormatedName(name: string) {
    return `${this.name}-${name}`;
  }

  protected getPolicyStatement() {
    return [
      {
        Effect: "Allow" as const,
        Action: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject",
        ],
        Resource: [this.bucket.arn, this.bucket.arn.apply((arn) => `${arn}/*`)],
      },
      {
        Effect: "Allow" as const,
        Action: [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
        ],
        Resource: [this.queue.arn],
      },
      {
        Effect: "Allow" as const,
        Action: [
          "dynamodb:BatchGetItem",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable",
        ],
        Resource: [this.table.arn, this.table.arn.apply((arn) => `${arn}/*`)],
      },
    ];
  }

  protected getEnvironment() {
    return {
      CACHE_BUCKET_NAME: this.bucket.name,
      CACHE_BUCKET_KEY_PREFIX: "_cache",
      CACHE_BUCKET_REGION: this.region,
      REVALIDATION_QUEUE_URL: this.queue.url,
      REVALIDATION_QUEUE_REGION: this.region,
      CACHE_DYNAMO_TABLE: this.table.name,
      // Those 2 are used only for image optimizer
      BUCKET_NAME: this.bucket.name,
      BUCKET_KEY_PREFIX: "_assets",
    };
  }

  protected createS3Origin(originKey: string): DistribOrigin {
    const s3Origin = this.openNextOutput.origins[originKey] as OpenNextS3Origin;
    return {
      type: "s3",
      originId: originKey,
      domainName: this.bucket.nodes.bucket.bucketRegionalDomainName,
      originPath: s3Origin.originPath,
    };
  }

  protected createLambdaOrigin(originKey: string): DistribOrigin {
    const lambdaOrigin = this.openNextOutput.origins[
      originKey
    ] as OpenNextServerFunctionOrigin;
    const statement = this.getPolicyStatement();
    const fn = new sst.aws.Function(`server${originKey}`, {
      bundle: path.join(".", lambdaOrigin.bundle),
      handler: lambdaOrigin.handler,
      streaming: lambdaOrigin.streaming,
      runtime: "nodejs20.x",
      environment: this.getEnvironment(),
      //@ts-ignore
      permissions: statement.map((s) => ({
        actions: s.Action,
        resources: s.Resource,
      })),
      url: true,
    });
    return {
      type: "function",
      originId: originKey,
      domainName: fn.url.apply((url) => {
        console.log("Lambda origin", url.replace("https://", "").slice(0, -1));
        return url.replace("https://", "").slice(0, -1);
      }),
    };
  }

  private buildApp() {
    execSync(`npx open-next@3.1.1 build --config-path ${this.configPath}`);

    const openNextOutput = readFileSync(".open-next/open-next.output.json", {
      encoding: "utf-8",
    });

    // If there is a dockerfile in .open-next/server-functions/default, copy it to image
    // There is a bug right now that make it not provide a dockerfile
    const dockerfile = path.join(
      ".open-next/server-functions/default",
      "Dockerfile",
    );
    if (existsSync(dockerfile)) {
      // For image optimization, we need to set the base image as node:18-slim because of sharp
      // alpine makes it crash
      writeFileSync(
        path.join(".open-next/image-optimization-function", "Dockerfile"),
        `FROM node:18-slim
WORKDIR /app
COPY . /app
EXPOSE 3000
CMD ["node", "index.mjs"]
        `,
      );
    }
    return JSON.parse(openNextOutput) as OpenNextOutput;
  }

  private createBucketAndUpload() {
    const bucket = new sst.aws.Bucket(this.getFormatedName("MyBucketAssets"), {
      transform: {
        policy: (p) => {
          const newPolicy = aws.iam.getPolicyDocumentOutput({
            statements: [
              {
                principals: [
                  {
                    type: "Service",
                    identifiers: ["cloudfront.amazonaws.com"],
                  },
                ],
                actions: ["s3:GetObject"],
                resources: [$interpolate`${bucket.arn}/*`],
              },
            ],
          }).json;
          console.log("newPolicy", newPolicy);
          p.policy = $output([p.policy, newPolicy]).apply(
            ([policy, newPolicy]) => {
              const policyJson = JSON.parse(policy as string);
              console.log("policyJson", policyJson);
              const newPolicyJson = JSON.parse(newPolicy as string);
              policyJson.Statement.push(...newPolicyJson.Statement);
              return JSON.stringify(policyJson);
            },
          );
        },
      },
    });

    bucket.name.apply((name) => {
      console.log("Uploading assets to bucket", name);
      execSync(`aws s3 sync .open-next/assets s3://${name}/_assets`);
      console.log("Uploading cache to bucket", name);
      execSync(`aws s3 sync .open-next/cache s3://${name}/_cache`);
    });
    return bucket;
  }

  protected createECSOrigin(originKey: string): DistribOrigin {
    const ecsOutput = this.openNextOutput.origins[
      originKey
    ] as OpenNextServerFunctionOrigin;

    const cluster = new aws.ecs.Cluster(
      this.getFormatedName(`${originKey.toUpperCase()}-Cluster`),
      {},
    );

    const alb = new awsx.lb.ApplicationLoadBalancer(`${originKey}-alb`, {
      defaultTargetGroup: {
        port: 3000,
        protocol: "HTTP",
        deregistrationDelay: 0,
        healthCheck: {
          path: "/__health",
        },
      },
    });

    if (!this.ecrRepository) {
      this.ecrRepository = new awsx.ecr.Repository("ecr", {
        forceDelete: true,
      });
    }

    const image = new awsx.ecr.Image(`${originKey}-image`, {
      repositoryUrl: this.ecrRepository.url,
      context: path.join(process.cwd(), ecsOutput.bundle),
      platform: "linux/amd64",
    });

    const policyDocument = aws.iam.getPolicyDocumentOutput({
      statements: this.getPolicyStatement().map((statement) => {
        return {
          actions: statement.Action,
          resources: statement.Resource,
        };
      }),
    });

    const service = new awsx.ecs.FargateService(`${originKey}-service`, {
      cluster: cluster.arn,
      assignPublicIp: true,
      desiredCount: 1,
      taskDefinitionArgs: {
        container: {
          name: `${originKey}-container`,
          image: image.imageUri,
          cpu: 512,
          memory: 1024,
          essential: true,
          portMappings: [
            {
              containerPort: 3000,
              targetGroup: alb.defaultTargetGroup,
            },
          ],
          environment: Object.entries(this.getEnvironment()).map(
            ([key, value]) => {
              return {
                name: key,
                value: value,
              };
            },
          ),
        },
        taskRole: {
          args: {
            inlinePolicies: [
              {
                name: "inlinePolicy",
                policy: policyDocument.json,
              },
            ],
          },
        },
      },
    });

    return {
      type: "function",
      originId: originKey,
      domainName: alb.loadBalancer.dnsName,
      useHttp: true,
    };
  }

  private createRevalidationStack() {
    const queue = new sst.aws.Queue(this.getFormatedName("MyQueue"), {
      fifo: true,
    });
    const revalidationFn =
      this.openNextOutput.additionalProps.revalidationFunction;
    const initFn = this.openNextOutput.additionalProps.initializationFunction;
    queue.subscribe(
      {
        description: "MyQueue subscription",
        handler: revalidationFn?.handler ?? "index.handler",
        bundle: path.join(".", revalidationFn.bundle),
        runtime: "nodejs20.x",
        timeout: "30 seconds",
        permissions: [
          {
            actions: [
              "sqs:ChangeMessageVisibility",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
              "sqs:GetQueueUrl",
              "sqs:ReceiveMessage",
            ],
            resources: [queue.arn],
          },
        ],
        live: false,
      },
      {
        transform: {
          eventSourceMapping: (e) => {
            e.batchSize = 5;
          },
        },
      },
    );

    const table = new aws.dynamodb.Table(this.getFormatedName("MyTable"), {
      attributes: [
        { name: "tag", type: "S" },
        { name: "path", type: "S" },
        { name: "revalidatedAt", type: "N" },
      ],
      hashKey: "tag",
      rangeKey: "path",
      pointInTimeRecovery: {
        enabled: true,
      },
      billingMode: "PAY_PER_REQUEST",
      globalSecondaryIndexes: [
        {
          name: "revalidate",
          hashKey: "path",
          rangeKey: "revalidatedAt",
          projectionType: "ALL",
        },
      ],
    });

    const seedFn = new sst.aws.Function(
      this.getFormatedName(`RevalidationSeeder`),
      {
        description: `ISR revalidation data seeder`,
        handler: initFn?.handler ?? "index.handler",
        bundle: path.join(".", initFn.bundle ?? ".open-next/dynamodb-provider"),
        runtime: "nodejs20.x",
        timeout: "900 seconds",
        memory: `128 MB`,
        permissions: [
          {
            actions: [
              "dynamodb:BatchWriteItem",
              "dynamodb:PutItem",
              "dynamodb:DescribeTable",
            ],
            resources: [table!.arn],
          },
        ],
        environment: {
          CACHE_DYNAMO_TABLE: table!.name,
        },
        live: false,
        _skipMetadata: true,
      },
    );
    new aws.lambda.Invocation(
      this.getFormatedName(`RevalidationSeed`),
      {
        functionName: seedFn.nodes.function.name,
        triggers: {
          version: Date.now().toString(),
        },
        input: JSON.stringify({
          RequestType: "Create",
        }),
      },
      { ignoreChanges: $dev ? ["*"] : undefined },
    );

    return { queue, table };
  }
}
