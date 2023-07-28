export interface LokiStream {
  stream: Record<string, string>;
  values: [unixEpoch: string, log: string][];
}

export interface RawQueryRangeResponse {
  status: "success";
  data: {
    resultType: "matrix" | "streams";
    result: LokiStream[];
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

export interface LabelResponse {
  status: "success";
  data: string[];
}

export interface LabelValuesResponse {
  status: "success";
  data: string[];
}
