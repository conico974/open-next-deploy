This project aim to demonstrate how to use OpenNext and SST to deploy a Next.js app to different places (Not natively supported by SST)

Given that OpenNext allow you to split your Next app into multiple parts, you can mix these examples to deploy your app to different places.

If you're missing a deployment example, feel free to open an issue or even better a PR.

**These are not meant to be used in production as they are**, but rather as a starting point for your own deployments.

## What's included

We include a few constructs that demonstrate how to deploy a Next.js app to different places. 

### Cloudfront

All these constructs support lambda backends, you just need to change the desired functions in the OpenNext config folder.

#### NextWithEc2AndCloudfront
It uses the `open-next/ec2.ts` config file for OpenNext.

To use this, you'll need to provide a private and public key as SST secrets.

With the current configuration, the app will be deployed partially to an EC2 instance and partially to a Lambda function.


#### NextWithEcsAndCloudfront
It uses the `open-next/ecs.ts` config file for OpenNext.

With the current configuration, the app will be deployed partially to an ECS Fargate cluster and partially to a Lambda function.

### ~~Cloudflare~~
Not yet implemented

### ~~GCP~~
Not yet implemented

### ~~Azure~~
Not yet implemented