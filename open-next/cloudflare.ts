import { OpenNextConfig } from "open-next/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "aws-lambda-streaming",
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
      //TODO: Remove this with the 3.1.4 release
      incrementalCache: () =>
        import("./custom/s3-lite").then((mod) => mod.default),
      tagCache: () => import("./custom/ddb-null").then((mod) => mod.default),
      queue: () => import("./custom/sqs-lite").then((mod) => mod.default),
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
