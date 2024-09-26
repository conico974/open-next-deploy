import { OpenNextConfig } from "open-next/types/open-next.js";

const config = {
  default: {
    override: {
      // There is an issue right now with the node wrapper that does not set the cookies properly
      // TODO: Remove this with the 3.1.4 release
      wrapper: () => import("./custom/nodeWrapper").then((mod) => mod.default),
      converter: "node",
      generateDockerfile: true,
    },
  },
  // functions: {
  //   protected: {
  //     patterns: ["dashboard", "login"],
  //     routes: ["app/(protected)/dashboard/page", "app/(protected)/login/page"],
  //   },
  // },
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
