import { BaseNextAWS, DistribOrigin } from "./BaseNextAWS";

export abstract class BaseNextWithCloudfront extends BaseNextAWS<aws.cloudfront.Distribution> {
  // CloudFront's managed CachingOptimized policy
  protected staticCachePolicyId = "658327ea-f89d-4fab-a63d-7e88639e58f6";
  protected serverCachePolicy!: aws.cloudfront.CachePolicy;

  protected cloudfrontFunction!: aws.cloudfront.Function;

  constructor(
    public name: string,
    public region: string,
    public configPath?: string,
  ) {
    super(name, region, configPath);
  }

  private createServerCacheBehavior(
    originKey: string,
  ): aws.types.input.cloudfront.DistributionDefaultCacheBehavior {
    return {
      targetOriginId: this.origins[originKey].originId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: [
        "GET",
        "HEAD",
        "OPTIONS",
        "PUT",
        "POST",
        "PATCH",
        "DELETE",
      ],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: this.serverCachePolicy.id,
      // CloudFront's Managed-AllViewerExceptHostHeader policy
      originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac",
      functionAssociations: [
        {
          eventType: "viewer-request",
          functionArn: this.cloudfrontFunction.arn,
        },
      ],
    };
  }

  private createStaticCacheBehavior(originKey: string, pathPattern = "*") {
    return {
      targetOriginId: this.origins[originKey].originId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      cachePolicyId: this.staticCachePolicyId,
      functionAssociations: [
        {
          eventType: "viewer-request",
          functionArn: this.cloudfrontFunction.arn,
        },
      ],
      pathPattern,
    };
  }

  private createServerCachePolicy() {
    return new aws.cloudfront.CachePolicy("ServerCachePolicy", {
      defaultTtl: 0,
      maxTtl: 31536000, // 1 year
      minTtl: 0,
      parametersInCacheKeyAndForwardedToOrigin: {
        cookiesConfig: {
          cookieBehavior: "none",
        },
        headersConfig: {
          headerBehavior: "whitelist",
          headers: {
            items: ["accept", "rsc"],
          },
        },
        queryStringsConfig: {
          queryStringBehavior: "all",
        },
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
      },
    });
  }

  private createS3OAC() {
    const oac = new aws.cloudfront.OriginAccessControl(
      this.getFormatedName("S3BucketPolicy"),
      {
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    );

    return oac;
  }

  createDistribution() {
    this.cloudfrontFunction = new aws.cloudfront.Function(
      this.getFormatedName("MyFunction"),
      {
        code: `
      function handler(event) {
        var request = event.request;
        request.headers["x-forwarded-host"] = request.headers.host;
        return request;
      }
      `,
        runtime: "cloudfront-js-1.0",
      },
    );

    this.serverCachePolicy = this.createServerCachePolicy();
    const s3OAC = this.createS3OAC();

    return new aws.cloudfront.Distribution(
      this.getFormatedName("MyDistribution"),
      {
        defaultCacheBehavior: this.createServerCacheBehavior("default"),
        enabled: true,
        orderedCacheBehaviors: this.openNextOutput.behaviors
          .filter((b) => b.pattern !== "*")
          .map((behavior) => {
            return behavior.origin === "s3"
              ? this.createStaticCacheBehavior(
                  behavior.origin,
                  behavior.pattern,
                )
              : {
                  ...this.createServerCacheBehavior(behavior.origin ?? ""),
                  pathPattern: behavior.pattern,
                };
          }),
        origins: Object.entries(this.origins).map(([key, origin]) => {
          return origin.type === "s3"
            ? {
                originId: origin.originId,
                domainName: origin.domainName,
                originPath: origin.originPath ? `/${origin.originPath}` : "",
                originAccessControlId: s3OAC.id,
              }
            : {
                originId: origin.originId,
                domainName: origin.domainName,
                customOriginConfig: {
                  originProtocolPolicy: origin.useHttp
                    ? "http-only"
                    : "https-only",
                  originSslProtocols: ["TLSv1.2"],
                  httpPort: origin.httpPort ?? 80,
                  httpsPort: 443,
                  originReadTimeout: 30,
                },
              };
        }),
        restrictions: {
          geoRestriction: {
            restrictionType: "none",
          },
        },
        viewerCertificate: {
          cloudfrontDefaultCertificate: true,
        },
      },
    );
  }

  get url() {
    return this.distribution.domainName;
  }
}
