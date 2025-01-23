import { DistribOrigin } from "./core/BaseNextAWS";
import { OpenNextS3Origin, OpenNextServerFunctionOrigin } from "./core/types";
import { BaseNextWithCloudflare } from "./core/BaseNextWithCloudflare";

export class MultiRegionNextWithCloudflare extends BaseNextWithCloudflare {
  constructor(private regions: aws.Region[]) {
    super("cloudflaremulti", "eu-west-1", "open-next/cloudflare-multi.ts");
    this.createRegionalOrigins();
    this.createOriginsAndDistribution();
  }

  createRegionalOrigins() {
    // We find the origin that we want to deploy to multiple regions
    // We could have deployed every origins in each region but for the sake of the example we only deploy one lambda
    const origin = this.openNextOutput.origins[
      "regional"
    ] as OpenNextServerFunctionOrigin;
    // We create a new origin for each region
    const regionalOrigins: Record<
      string,
      { host: $util.Output<string>; protocol: "https" }
    > = Object.fromEntries(
      this.regions.map((region) => {
        const originKey = `regional-${region}`;
        const provider = new aws.Provider(`provider-${region}`, {
          region,
        });
        if (
          (origin.type === "ecs" || origin.type === "function") &&
          origin.wrapper === "node"
        ) {
          throw new Error("Multi regional ecs has not been implemented");
        } else {
          const lambdaOrigin = this.createLambdaOrigin(
            "regional",
            provider,
            region,
          );
          return [
            originKey,
            {
              host: lambdaOrigin.domainName,
              protocol: "https",
            },
          ] as const;
        }
      }),
    );
    this.middlewareEnv = {
      REGIONAL_ORIGINS: $util.jsonStringify(regionalOrigins),
    };
  }

  // This will create all the origins for the distribution in the default region
  createOrigins(): Record<string, DistribOrigin> {
    const origins: [string, DistribOrigin][] = Object.entries(
      this.openNextOutput.origins,
    ).map(([key, value]) => {
      if (key === "s3") {
        value = value as OpenNextS3Origin;
        return [key, this.createS3Origin(key)];
      } else if (
        (value.type === "ecs" || value.type === "function") &&
        value.wrapper === "node"
      ) {
        return [key, this.createECSOrigin(key)];
      }
      return [key, this.createLambdaOrigin(key)];
    });
    return Object.fromEntries(origins);
  }
}
