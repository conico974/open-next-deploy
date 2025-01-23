import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "aws-lambda-streaming",

      // Uncomment the following lines to use the node wrapper and deploy in ecs
      // wrapper: "node",
      // converter: "node",
      // generateDockerfile: true,
    },
  },
  functions: {
    // This one will be deployed both in the default region and all the other ones
    regional: {
      patterns: ["dashboard", "login"],
      routes: ["app/(protected)/dashboard/page", "app/(protected)/login/page"],
      override: {
        wrapper: "aws-lambda-streaming",
      },
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
    originResolver: () =>
      import("./custom/resolver").then((mod) => mod.default),
  },
  dangerous: {
    enableCacheInterception: true,
  },

  imageOptimization: {
    install: {
      packages: ["sharp"],
      arch: "x64",
    },
    // override: {
    //   wrapper: "node",
    //   converter: "node",
    //   generateDockerfile: true,
    // },
  },
} satisfies OpenNextConfig;

export default config;
