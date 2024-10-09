import { OpenNextConfig } from "open-next/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "node",
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
