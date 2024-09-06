import { OpenNextConfig } from "open-next/types/open-next.js";

const config = {
  default: {
    override: {
      wrapper: "node",
      converter: "node",
    },
  },
} satisfies OpenNextConfig;

export default config;
