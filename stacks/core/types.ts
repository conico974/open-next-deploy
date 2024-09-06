type BaseFunction = {
  handler: string;
  bundle: string;
};

type OpenNextFunctionOrigin = {
  type: "function" | "ecs";
  streaming?: boolean;
  wrapper: string;
  converter: string;
} & BaseFunction;

export type OpenNextServerFunctionOrigin = OpenNextFunctionOrigin & {
  queue: string;
  incrementalCache: string;
  tagCache: string;
};

export type OpenNextImageOptimizationOrigin = OpenNextFunctionOrigin & {
  imageLoader: string;
};

export type OpenNextS3Origin = {
  type: "s3";
  originPath: string;
  copy: {
    from: string;
    to: string;
    cached: boolean;
    versionedSubDir?: string;
  }[];
};

export interface OpenNextOutput {
  edgeFunctions: {
    [key: string]: BaseFunction;
  } & {
    middleware?: BaseFunction & { pathResolver: string };
  };
  origins: {
    s3: OpenNextS3Origin;
    default: OpenNextServerFunctionOrigin;
    imageOptimizer: OpenNextImageOptimizationOrigin;
  } & {
    [key: string]: OpenNextServerFunctionOrigin | OpenNextS3Origin;
  };
  behaviors: {
    pattern: string;
    origin?: string;
    edgeFunction?: string;
  }[];
  additionalProps: {
    disableIncrementalCache?: boolean;
    disableTagCache?: boolean;
    initializationFunction: BaseFunction;
    warmer?: BaseFunction;
    revalidationFunction: BaseFunction;
  };
}

export interface OriginProps {
  bucket: sst.aws.Bucket;
  queue: sst.aws.Queue;
  table: aws.dynamodb.Table;
  region: string;
  openNextOrigin: OpenNextOutput["origins"]["default"];
}
