/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "cloudflare-MyBucketAssets": {
      "name": string
      "type": "sst.aws.Bucket"
    }
  }
}
export {}
