// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";
import dayjs from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import * as utils from "./utils.js";

export interface LokiStream {
  stream: Record<string, string>;
  values: [unixEpoch: string, log: string][];
}

export interface QueryRangeResponse {
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

export interface LokiQueryOptions {
  /**
   * @default 100
   * */
  limit?: number;
  /**
   * @default "12h"
   * */
  range?: string;
  regex?: RegExp;
}

export interface GrafanaLokiOptions {
  apiToken?: string;
  remoteApiURL: string | URL;
}

export default class GrafanaLoki {
  private apiToken: string;
  private remoteApiURL: URL;

  constructor(options: GrafanaLokiOptions) {
    const { apiToken, remoteApiURL } = options;

    this.apiToken = apiToken ?? process.env.GRAFANA_API_TOKEN!;
    if (!this.apiToken) {
      throw new Error("An apiToken must be provided to use the Grafana Loki API");
    }

    this.remoteApiURL = typeof remoteApiURL === "string" ? new URL(remoteApiURL) : remoteApiURL;
  }

  get httpOptions() {
    return {
      headers: {
        authorization: `Bearer ${this.apiToken}`
      }
    };
  }

  async queryRange<T = string>(
    logQL: string,
    options: LokiQueryOptions = {}
  ): Promise<T[]> {
    const {
      limit = 100,
      range = "12h",
      regex = null
    } = options;

    const start = dayjs().subtract(ms(range), "milliseconds");

    /**
     * @see https://grafana.com/docs/loki/latest/api/#query-loki-over-a-range-of-time
     */
    const uri = new URL("loki/api/v1/query_range", this.remoteApiURL);
    uri.searchParams.set("query", logQL);
    uri.searchParams.set("limit", limit.toString());
    uri.searchParams.set("start", start.unix().toString());

    const { data } = await httpie.get<QueryRangeResponse>(
      uri, this.httpOptions
    );
    const logs = utils.inlineLogs(data);

    if (regex) {
      return logs.flatMap((log) => {
        const rResult = regex.exec(log);

        return rResult === null ? [] : [rResult.groups];
      }) as T[];
    }

    return logs as T[];
  }
}
