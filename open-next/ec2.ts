import { OpenNextConfig } from "open-next/types/open-next.js";

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
    arch: "x64",
  },
} satisfies OpenNextConfig;

export default config;
