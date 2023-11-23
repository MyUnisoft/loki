// Import Internal Dependencies
import { TimeRange } from "./utils.js";

export interface LokiStream {
  stream: Record<string, string>;
  values: [unixEpoch: string, log: string][];
}

export interface LokiMatrix {
  metric: Record<string, string>;
  values: [unixEpoch: string, value: string][];
}

export interface LokiStreamResult<T = string> {
  stream: Record<string, string>;
  values: T[];
}

export interface RawQueryRangeResponse<T = LokiStream> {
  status: "success";
  data: {
    resultType: "matrix" | "streams";
    result: T[];
    stats: {
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
      }
    };
  }
}

export type LokiStandardBaseResponse<S> = {
  status: "failed";
} | {
  status: "success";
  data: S;
}

export interface QueryRangeResponse<T> {
  values: T[];
  timerange: TimeRange | null;
}

export interface QueryRangeStreamResponse<T> {
  logs: LokiStreamResult<T>[];
  timerange: TimeRange | null;
}

export { TimeRange };
