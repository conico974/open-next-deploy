import { AwsClient } from "aws4fetch";

import type { Extension } from "@opennextjs/aws/types/cache.js";
import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js";

let awsClient: AwsClient | null = null;

const getAwsClient = () => {
  if (!awsClient) {
    awsClient = new AwsClient({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
  }
  return awsClient;
};
const awsFetch = async (key: string, options: RequestInit) => {
  const { CACHE_BUCKET_NAME, CACHE_BUCKET_REGION } = process.env;
  const client = getAwsClient();
  const url = `https://${CACHE_BUCKET_NAME}.s3.${CACHE_BUCKET_REGION}.amazonaws.com/${key}`;
  console.log("fetching", url);
  return await client.fetch(url, options);
};

function buildS3Key(key: string, extension: Extension) {
  const { CACHE_BUCKET_KEY_PREFIX, NEXT_BUILD_ID } = process.env;
  return `${CACHE_BUCKET_KEY_PREFIX}/${extension === "fetch" ? "__fetch/" : ""}${NEXT_BUILD_ID}${extension === "fetch" ? `/${key}` : key}${extension === "fetch" ? "" : `.${extension}`}`;
}

const incrementalCache: IncrementalCache = {
  async get(key, isFetch) {
    const result = await awsFetch(
      `${buildS3Key(key, isFetch ? "fetch" : "cache")}`,
      {
        method: "GET",
      },
    );

    if (result.status === 404) {
      throw new Error("Not found");
    } else if (result.status !== 200) {
      throw new Error(`Failed to get cache: ${result.status}`);
    } else {
      const cacheData: any = await result.json();
      return {
        value: cacheData,
        lastModified: new Date(
          result.headers.get("last-modified") ?? "",
        ).getTime(),
      };
    }
  },
  async set(key, value, isFetch): Promise<void> {
    const response = await awsFetch(
      `${buildS3Key(key, isFetch ? "fetch" : "cache")}`,
      {
        method: "PUT",
        body: JSON.stringify(value),
      },
    );
    if (response.status !== 200) {
      throw new Error(`Failed to set cache: ${response.status}`);
    }
  },
  async delete(key): Promise<void> {
    const response = await awsFetch(`${buildS3Key(key, "cache")}`, {
      method: "DELETE",
    });
    if (response.status !== 204) {
      throw new Error(`Failed to delete cache: ${response.status}`);
    }
  },
  name: "s3",
};

export default incrementalCache;
