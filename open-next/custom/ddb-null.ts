import { TagCache } from "open-next/cache/tag/types.js";

const tagCache: TagCache = {
  async getByPath(path) {
    return [];
  },
  async getByTag(tag) {
    return [];
  },
  async getLastModified(key, lastModified) {
    return lastModified ?? Date.now();
  },
  async writeTags(tags) {
    return;
  },
  name: "dynamoDb",
};

export default tagCache;
