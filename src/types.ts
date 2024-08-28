// Import Third-party Dependencies
import {
  LokiLiteralPattern,
  LokiPatternType
} from "@sigyn/pattern";

// Import Internal Dependencies
import { TimeRange } from "./utils.js";

export type LokiStandardBaseResponse<S> = {
  status: "failed";
} | {
  status: "success";
  data: S;
};

export interface LokiQueryRangeStats {
  summary: {
    bytesProcessedPerSecond: number;
    linesProcessedPerSecond: number;
    totalBytesProcessed: number;
    totalLinesProcessed: number;
    execTime: number;
  };
  store: {
    totalChunksRef: number;
    totalChunksDownloaded: number;
    chunksDownloadTime: number;
    headChunkBytes: number;
    headChunkLines: number;
    decompressedBytes: number;
    decompressedLines: number;
    compressedBytes: number;
    totalDuplicates: number;
  };
  ingester: {
    totalReached: number;
    totalChunksMatched: number;
    totalBatches: number;
    totalLinesSent: number;
    headChunkBytes: number;
    headChunkLines: number;
    decompressedBytes: number;
    decompressedLines: number;
    compressedBytes: number;
    totalDuplicates: number;
  };
}

interface RawQueryRangeTemplate<
  Type extends "matrix" | "streams" | "vector",
  Result extends LokiMatrix[] | LokiVector | LokiStream[]
> {
  status: "success";
  data: {
    resultType: Type;
    result: Result;
    stats: LokiQueryRangeStats;
  };
}

export type RawQueryRangeResponse<T extends "matrix" | "streams" | "vector"> =
  T extends "matrix" ? RawQueryRangeTemplate<T, LokiMatrix[]> :
    T extends "streams" ? RawQueryRangeTemplate<T, LokiStream[]> :
      RawQueryRangeTemplate<T, LokiVector>;

export type LokiLabels = Record<string, string>;

export interface LokiVector {
  metric: LokiLabels;
  values: [unixEpoch: number, metric: string];
}

export interface LokiStream<T = string> {
  stream: LokiLabels;
  values: [unixEpoch: number, log: T][];
}

export interface LokiMatrix {
  metric: LokiLabels;
  values: [unixEpoch: number, metric: string][];
}

export interface LokiCombined<T = string> {
  labels: LokiLabels;
  values: [unixEpoch: number, log: T][];
}

export interface QueryRangeLogsResponse<T extends LokiPatternType> {
  logs: LokiLiteralPattern<T>[];
  timerange: TimeRange | null;
}

export interface QueryRangeStreamResponse<T extends LokiPatternType> {
  streams: LokiCombined<LokiLiteralPattern<T>>[];
  timerange: TimeRange | null;
}

export interface QueryRangeMatrixResponse {
  metrics: LokiCombined<string>[];
  timerange: TimeRange | null;
}

export type { TimeRange };
