import type { OriginResolver } from "@opennextjs/aws/types/overrides.js";
import defaultResolver from "@opennextjs/aws/overrides/originResolver/pattern-env.js";

const originResolver: OriginResolver = {
  name: "custom",
  async resolve(path) {
    if (
      globalThis.__CURRENT_REGION &&
      (path.startsWith("/dashboard") || path.startsWith("/login"))
    ) {
      const regionalOrigins = JSON.parse(process.env.REGIONAL_ORIGINS ?? "{}");
      // We try to find the origin that matches the path
      const origin = regionalOrigins[`regional-${globalThis.__CURRENT_REGION}`];
      if (origin) {
        globalThis.__CURRENT_REGION = undefined;
        return origin;
      }
    }
    globalThis.__CURRENT_REGION = undefined;
    return defaultResolver.resolve(path);
  },
};

export default originResolver;
