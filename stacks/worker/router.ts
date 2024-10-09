import { AwsClient } from "aws4fetch";

export interface Env {
  SERVER: any;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  CACHE_BUCKET_NAME: string;
  CACHE_BUCKET_REGION: string;
  SST_ROUTES: string;
}

let awsClient: AwsClient;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/^\//, "");

    const SST_ROUTES = JSON.parse(env.SST_ROUTES) as {
      regex: string;
      origin: "middleware" | "assets";
    }[];

    // Return from cache if available
    let cachedResponse = await lookupCache();
    if (cachedResponse) return cachedResponse;

    const route = SST_ROUTES.find((r) => new RegExp(r.regex).test(pathname));
    console.log("route", route);

    if (route?.origin === "assets") {
      if (!awsClient) {
        console.log("Creating AWS client", env);
        awsClient = new AwsClient({
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        });
      }
      const response = await awsClient.fetch(
        `https://${env.CACHE_BUCKET_NAME}.s3.${env.CACHE_BUCKET_REGION}.amazonaws.com/_assets/${pathname}`,
        {
          method: "GET",
        },
      );
      saveCache(response);
      return response;
    }

    const resp = await env.SERVER.fetch(request);
    saveCache(resp);
    return resp;

    async function lookupCache() {
      // @ts-ignore
      const cache = caches.default;
      const r = await cache.match(request);

      // cache does not exist
      if (!r) return;

      // cache exists
      return r;
    }

    async function saveCache(response: Response) {
      // @ts-ignore
      const cache = caches.default;
      await cache.put(request, response.clone());
    }
  },
};
