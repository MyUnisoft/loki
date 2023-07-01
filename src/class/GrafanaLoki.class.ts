// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";

// Import Internal Dependencies
import * as utils from "../utils.js";
import { QueryRangeResponse } from "../types.js";
import { NoopLogParser, LogParserLike } from "./LogParser.class.js";

export interface LokiQueryOptions<T> {
  /**
   * @default 100
   * */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
  parser?: LogParserLike<T>;
}

export interface GrafanaLokiConstructorOptions {
  /**
   * Grafana API Token
   */
  apiToken?: string;
  /**
   * Remote Grafana root API URL
   */
  remoteApiURL: string | URL;
}

export class GrafanaLoki {
  private apiToken: string;
  private remoteApiURL: URL;

  constructor(options: GrafanaLokiConstructorOptions) {
    const { apiToken, remoteApiURL } = options;

    this.apiToken = apiToken ?? process.env.GRAFANA_API_TOKEN!;
    if (typeof this.apiToken === "undefined") {
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
    options: LokiQueryOptions<T> = {}
  ): Promise<T[]> {
    const {
      limit = 100,
      parser = new NoopLogParser<T>()
    } = options;

    /**
     * @see https://grafana.com/docs/loki/latest/api/#query-loki-over-a-range-of-time
     */
    const uri = new URL("loki/api/v1/query_range", this.remoteApiURL);
    uri.searchParams.set("query", logQL);
    uri.searchParams.set("limit", limit.toString());
    if (options.start) {
      uri.searchParams.set("start", utils.durationToUnixTimestamp(options.start));
    }
    if (options.end) {
      uri.searchParams.set("end", utils.durationToUnixTimestamp(options.end));
    }
    if (options.since) {
      uri.searchParams.set("since", options.since);
    }

    const { data } = await httpie.get<QueryRangeResponse>(
      uri, this.httpOptions
    );

    return parser.executeOnLogs(
      utils.inlineLogs(data)
    );
  }
}
