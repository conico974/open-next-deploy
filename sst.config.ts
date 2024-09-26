/// <reference path="./.sst/platform/config.d.ts" />
import { NextWithEc2AndCloudfront } from "./stacks/NextWithEc2";
import { NextWithEcsAndCloudfront } from "./stacks/NextWithEcs";
import { NextWithEcsAndCloudflare } from "./stacks/NextWithEcsAndCloudflare";
export default $config({
  app(input) {
    return {
      name: "open-next-deploy",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        command: true,
        awsx: true,
        cloudflare: true,
      },
    };
  },
  async run() {
    const publicKey = new sst.Secret("PublicKey");
    const privateKey = new sst.Secret("PrivateKey");
    // This one deploys either to EC2 or lambda (depending on the origin type)
    // const site = new NextWithEc2AndCloudfront(publicKey, privateKey);
    // This one deploys either to ECS or lambda (depending on the origin type)
    // const site = new NextWithEcsAndCloudfront();
    // This one deploys either to ECS or lambda (depending on the origin type), but with Cloudflare in front and with the middleware inside cloudflare
    const site = new NextWithEcsAndCloudflare();
    return {
      siteUrl: site.url,
    };
  },
});
