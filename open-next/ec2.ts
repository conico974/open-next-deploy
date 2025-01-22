import { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "node",
      converter: "node",
    },
  },
  functions: {
    protected: {
      patterns: ["dashboard/*", "login/*"],
      routes: ["app/(protected)/dashboard/page", "app/(protected)/login/page"],
    },
  },
  imageOptimization: {
    install: {
      packages: ["sharp"],
      arch: "x64",
    },
  },
} satisfies OpenNextConfig;

export default config;
