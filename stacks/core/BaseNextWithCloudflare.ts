import { readFileSync } from "fs";
import { BaseNextAWS } from "./BaseNextAWS";

export abstract class BaseNextWithCloudflare extends BaseNextAWS<sst.cloudflare.Worker> {
  private createAWSAccessKey() {
    const iamUser = new aws.iam.User(this.getFormatedName("iam-user"), {
      forceDestroy: true,
    });

    new aws.iam.UserPolicy(this.getFormatedName("iam-policy"), {
      user: iamUser.name,
      policy: {
        Version: "2012-10-17",
        Statement: this.getPolicyStatement(),
      },
    });

    const keys = new aws.iam.AccessKey(this.getFormatedName("credentials"), {
      user: iamUser.name,
    });

    return keys;
  }

  private createMiddleware(): cloudflare.WorkerScript {
    const openNextOrigins = Object.fromEntries(
      Object.entries(this.origins).map(([originName, origin]) => {
        return [
          originName,
          {
            host: origin.domainName,
            protocol:
              origin.type === "function" && origin.useHttp ? "http" : "https",
          },
        ] as const;
      }),
    );

    // Get the buildId
    const buildId = readFileSync(".next/BUILD_ID", "utf-8").trim();
    console.log(process.cwd());

    const keys = this.createAWSAccessKey();

    return new cloudflare.WorkerScript(
      this.getFormatedName("next-middleware"),
      {
        accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
        content: readFileSync(".open-next/middleware/handler.mjs", "utf-8"),
        name: this.getFormatedName("next-middleware"),
        module: true,
        compatibilityDate: "2024-04-04",
        compatibilityFlags: ["nodejs_compat"],
        plainTextBindings: [
          {
            name: "OPEN_NEXT_ORIGIN",
            text: $util.jsonStringify(openNextOrigins),
          },
          {
            name: "DISABLE_CACHE",
            text: "true",
          },
          {
            name: "NEXT_BUILD_ID",
            text: buildId,
          },
          {
            name: "AWS_ACCESS_KEY_ID",
            text: keys.id,
          },
          ...Object.entries(this.getEnvironment()).map(([key, value]) => ({
            name: key,
            text: value,
          })),
        ],
        secretTextBindings: [
          {
            name: "AWS_SECRET_ACCESS_KEY",
            text: keys.secret,
          },
        ],
      },
    );
  }

  createDistribution(): sst.cloudflare.Worker {
    const middleware = this.createMiddleware();
    const routes = this.openNextOutput.behaviors
      .filter((b) => b.origin === "s3" || b.origin === "imageOptimizer")
      .map((behavior) => {
        const regex = behavior.pattern
          .replace(/\*\*/g, "(.*)")
          .replace(/\*/g, "([^/]*)")
          .replace(/\//g, "\\/")
          .replace(/\?/g, ".");
        if (behavior.origin === "imageOptimizer") {
          return {
            regex,
            origin: "middleware",
          };
        }
        return {
          regex,
          origin: "assets",
        };
      });

    return new sst.cloudflare.Worker("NextDistribution", {
      handler: "stacks/worker/router.ts",
      url: true,
      link: [this.bucket],
      transform: {
        worker: (workerArgs) => {
          workerArgs.plainTextBindings = $util
            .all([workerArgs.plainTextBindings])
            .apply(([plainTextBindings]) => [
              ...(plainTextBindings ?? []),
              {
                name: "CACHE_BUCKET_NAME",
                text: this.bucket.name,
              },
              {
                name: "CACHE_BUCKET_REGION",
                text: this.region,
              },
              {
                name: "SST_ROUTES",
                text: JSON.stringify(routes),
              },
            ]);

          workerArgs.serviceBindings = [
            { name: "SERVER", service: middleware.name },
          ];
        },
      },
    });
  }

  get url() {
    return this.distribution.url;
  }
}
