This project aim to demonstrate how to use OpenNext (the aws adapter) and SST to deploy a Next.js app to different places (Not natively supported by SST)

Given that @opennextjs/aws allow you to split your Next app into multiple parts, you can mix these examples to deploy your app to different places.

It requires @opennextjs/aws@3.1.4 or higher.

If you're missing a deployment example, feel free to open an issue or even better a PR.

**These are not meant to be used in production as they are**, but rather as a starting point for your own deployments.

## What's included

We include a few constructs that demonstrate how to deploy a Next.js app to different places. 

### Cloudfront

All these constructs support lambda backends, you just need to change the desired functions in the OpenNext config folder.

#### NextWithEc2AndCloudfront
It uses the `open-next/ec2.ts` config file for OpenNext.

To use this, you'll need to provide a private and public key as SST secrets.

With the current configuration, the app will be deployed partially to an EC2 instance and partially to a Lambda function. `dashboard` and `login` are deployed to lambda, the rest to an EC2 instance.


#### NextWithEcsAndCloudfront
It uses the `open-next/ecs.ts` config file for OpenNext.

With the current configuration, the app will be deployed partially to an ECS Fargate cluster. It also supports deploying to lambda, it just needs to be configured in the OpenNext config file.


### Cloudflare

This example only deploy the middleware to Cloudflare, if you wish to fully deploy on cloudflare see 
[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)

#### NextWithEcsAndCloudflare
It uses the `open-next/cloudflare.ts` config file for OpenNext.

With the current configuration, the app can be deployed partially to an ECS Fargate cluster and partially to Lambda functions. The middleware is also deployed on Cloudflare and ISR/SSG routes are served directly from the edge.

#### MultiRegionNextWithCloudflare
It uses the `open-next/cloudflare-multi.ts` config file for OpenNext. It uses a custom `OriginResolver` to determine the region from which the app will be served.

With the current configuration, the app can be deployed partially to an ECS Fargate cluster and partially to Lambda functions. The middleware is also deployed on Cloudflare and ISR/SSG routes are served directly from the edge. 

Both `/dashboard` and `/login` are deployed to multiple regions (i.e. The default one and the ones provided to the). The region from which it will be served is based on the `x-region` header to make it easier to test. In a real-world scenario, you would use the user's location (or similar) to determine the region.
This open the possibility to deploy your app to multiple regions (with support for lambda streaming) and serve it from the closest one to the user alongside with user specific data located in the closest region.
It could also be used to restrict content to some region for legal reasons.