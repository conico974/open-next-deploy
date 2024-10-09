import { OpenNextConfig } from "open-next/types/open-next.js";

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
    protected: {
      patterns: ["dashboard", "login"],
      routes: ["app/(protected)/dashboard/page", "app/(protected)/login/page"],
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare",
      converter: "edge",
    },
  },
  dangerous: {
    enableCacheInterception: true,
  },

  imageOptimization: {
    arch: "x64",
    // override: {
    //   wrapper: "node",
    //   converter: "node",
    //   generateDockerfile: true,
    // },
  },
} satisfies OpenNextConfig;

export default config;
