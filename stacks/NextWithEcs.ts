import path from "path";
import { DistribOrigin } from "./core/BaseNextAWS";
import { BaseNextWithCloudfront } from "./core/BaseNextWithCloudfront";
import { OpenNextS3Origin, OpenNextServerFunctionOrigin } from "./core/types";

export class NextWithEcsAndCloudfront extends BaseNextWithCloudfront {
  constructor() {
    super("ecs", "eu-west-1", "open-next/ecs.ts");
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
