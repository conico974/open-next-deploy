import { DistribOrigin } from "./core/BaseNextAWS";
import { OpenNextS3Origin } from "./core/types";
import { BaseNextWithCloudflare } from "./core/BaseNextWithCloudflare";

export class NextWithEcsAndCloudflare extends BaseNextWithCloudflare {
  constructor() {
    super("cloudflare", "eu-west-1", "open-next/cloudflare.ts");
    this.createOriginsAndDistribution();
  }

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
