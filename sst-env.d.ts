/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "NextDistribution": {
      "type": "sst.cloudflare.Worker"
      "url": string
    }
    "PrivateKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "PublicKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "cloudflare-MyBucketAssets": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "cloudflare-MyQueue": {
      "type": "sst.aws.Queue"
      "url": string
    }
    "cloudflare-RevalidationSeeder": {
      "name": string
      "type": "sst.aws.Function"
    }
    "serverdefault": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "serverimageOptimizer": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "serverprotected": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}