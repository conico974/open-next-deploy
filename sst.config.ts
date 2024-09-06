/// <reference path="./.sst/platform/config.d.ts" />
import { NextWithEc2AndCloudfront } from "./stacks/NextWithEc2";
import { NextWithEcsAndCloudfront } from "./stacks/NextWithEcs";
export default $config({
  app(input) {
    return {
      name: "open-next-deploy",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        command: true,
        awsx: true,
      },
    };
  },
  async run() {
    const publicKey = new sst.Secret("PublicKey");
    const privateKey = new sst.Secret("PrivateKey");
    const site = new NextWithEc2AndCloudfront(publicKey, privateKey);
    // const site = new NextWithEcsAndCloudfront();
    return {
      siteUrl: site.url,
    };
  },
});
