// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";
import autoURL from "@openally/auto-url";
import {
  LogQL,
  StreamSelector
} from "@sigyn/logql";
import {
  Pattern,
  NoopPattern,
  LokiPatternType,
  PatternShape
} from "@sigyn/pattern";

// Import Internal Dependencies
import * as utils from "../utils.js";
import {
  LokiStandardBaseResponse,
  RawQueryRangeResponse,
  QueryRangeLogsResponse,
  QueryRangeStreamResponse,
  QueryRangeMatrixResponse,
  LokiIngestLogs
} from "../types.js";
import { ApiCredential } from "./ApiCredential.class.js";

// CONSTANTS
function kDurationTransformer(value: string | number) {
  return utils.durationToUnixTimestamp(value);
}
const kAutoURLGrafanaTransformer = {
  start: kDurationTransformer,
  end: kDurationTransformer
};

export interface LokiQueryOptions {
  /**
   * @default 100
   */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
}

export interface LokiQueryStreamOptions<T extends LokiPatternType> extends LokiQueryOptions {
  pattern?: T;
}

export interface LokiLabelsOptions {
  /**
   * The start time for the query as
   * - a nanosecond Unix epoch.
   * - a duration (i.e "2h")
   *
   * Default to 6 hours ago.
   */
  start?: number | string;
  /**
   * The end time for the query as
   * - a nanosecond Unix epoch.
   * - a duration (i.e "2h")
   *
   * Default to now
   */
  end?: number | string;
  /**
   * A duration used to calculate start relative to end. If end is in the future, start is calculated as this duration before now.
   *
   * Any value specified for start supersedes this parameter.
   */
  since?: string;
}

export interface LokiLabelValuesOptions extends LokiLabelsOptions {
  /**
   * A set of log stream selector that selects the streams to match and return label values for <name>.
   *
   * Example: {"app": "myapp", "environment": "dev"}
   */
  query?: string;
}

export class Loki {
  private remoteApiURL: URL;
  private credential: ApiCredential;

  constructor(
    remoteApiURL: URL,
    credential: ApiCredential
  ) {
    this.remoteApiURL = remoteApiURL;
    this.credential = credential;
  }

  #fetchQueryRange<T extends "matrix" | "streams">(
    logQL: LogQL | string,
    options: LokiQueryOptions = {}
  ): Promise<httpie.RequestResponse<RawQueryRangeResponse<T>>> {
    const { limit = 100 } = options;

    /**
     * @see https://grafana.com/docs/loki/latest/api/#query-loki-over-a-range-of-time
     */
    const query = typeof logQL === "string" ? logQL : logQL.toString();
    const uri = autoURL(
      new URL("loki/api/v1/query_range", this.remoteApiURL),
      { ...options, limit, query },
      kAutoURLGrafanaTransformer
    );

    return httpie.get<RawQueryRangeResponse<T>>(
      uri, this.credential.httpOptions
    );
  }

  async queryRangeMatrix(
    logQL: LogQL | string,
    options: LokiQueryOptions = {}
  ): Promise<QueryRangeMatrixResponse> {
    if (LogQL.type(logQL) === "query") {
      throw new Error("Log queries must use `queryRangeStream` method");
    }

    const { data } = await this.#fetchQueryRange<"matrix">(
      logQL,
      options
    );

    return {
      metrics: data.data.result.map((result) => {
        return {
          labels: result.metric,
          values: result.values
        };
      }),
      timerange: utils.streamOrMatrixTimeRange(data.data.result)
    };
  }

  async queryRangeStream<T extends LokiPatternType = string>(
    logQL: LogQL | string,
    options: LokiQueryStreamOptions<T> = {}
  ): Promise<QueryRangeStreamResponse<T>> {
    if (LogQL.type(logQL) === "metric") {
      throw new Error("Metric queries must use `queryRangeMatrix` method");
    }

    const { pattern = new NoopPattern() } = options;
    const parser: PatternShape<any> = pattern instanceof NoopPattern ?
      pattern : new Pattern<any>(pattern);

    const { data } = await this.#fetchQueryRange<"streams">(
      logQL,
      options
    );

    return {
      streams: data.data.result.map((result) => {
        return {
          labels: result.stream,
          values: result.values
            .map(([unixEpoch, log]) => [unixEpoch, ...parser.executeOnLogs([log])])
            .filter((log) => log.length > 1) as any[]
        };
      }),
      timerange: utils.streamOrMatrixTimeRange(data.data.result)
    };
  }

  async queryRange<T extends LokiPatternType = string>(
    logQL: LogQL | string,
    options: LokiQueryStreamOptions<T> = {}
  ): Promise<QueryRangeLogsResponse<T>> {
    const { pattern = new NoopPattern() } = options;
    const parser: PatternShape<any> = pattern instanceof NoopPattern ?
      pattern : new Pattern<any>(pattern);

    const { data } = await this.#fetchQueryRange<"streams">(logQL, options);

    const inlinedLogs = utils.inlineLogs(data);
    if (inlinedLogs === null) {
      return {
        logs: [], timerange: null
      };
    }

    return {
      logs: parser.executeOnLogs(inlinedLogs.values) as any[],
      timerange: inlinedLogs.timerange
    };
  }

  async labels(options: LokiLabelsOptions = {}): Promise<string[]> {
    const uri = autoURL(
      new URL("loki/api/v1/labels", this.remoteApiURL),
      options,
      kAutoURLGrafanaTransformer
    );

    const { data: labels } = await httpie.get<LokiStandardBaseResponse<string[]>>(
      uri, this.credential.httpOptions
    );

    return labels.status === "success" ? labels.data : [];
  }

  async labelValues(
    label: string,
    options: LokiLabelValuesOptions = {}
  ): Promise<string[]> {
    const uri = autoURL(
      new URL(`loki/api/v1/label/${label}/values`, this.remoteApiURL),
      options,
      kAutoURLGrafanaTransformer
    );

    const { data: labelValues } = await httpie.get<LokiStandardBaseResponse<string[]>>(
      uri, this.credential.httpOptions
    );

    return labelValues.status === "success" ? labelValues.data : [];
  }

  async series<T = Record<string, string>>(
    ...match: [StreamSelector | string, ...(StreamSelector | string)[]]
  ): Promise<T[]> {
    const uri = new URL(`loki/api/v1/series`, this.remoteApiURL);

    // Note: Grafana API seem to want the match[] syntax
    const { data: listSeries } = await httpie.get<LokiStandardBaseResponse<T[]>>(uri, {
      querystring: new URLSearchParams(
        match.map((selector) => ["match", new StreamSelector(selector).toString()] as [string, string])
      )
    });

    return listSeries.status === "success" ? listSeries.data : [];
  }

  async push(
    logs: Iterable<LokiIngestLogs>
  ): Promise<void> {
    const uri = new URL("loki/api/v1/push", this.remoteApiURL);
    const { headers } = this.credential.httpOptions;

    await httpie.post(uri, {
      body: {
        streams: Array.from(logs)
      },
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  }
}
