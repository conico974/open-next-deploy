import { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "node",
      converter: "node",
    },
  },
} satisfies OpenNextConfig;

export default config;
