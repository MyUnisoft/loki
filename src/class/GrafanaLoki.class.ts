/* eslint-disable func-style */
// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";
import autoURL from "@openally/auto-url";

// Import Internal Dependencies
import * as utils from "../utils.js";
import {
  LabelResponse,
  LabelValuesResponse,
  LokiStreamResult,
  RawQueryRangeResponse,
  LokiStream,
  LokiMatrix
} from "../types.js";
import { NoopLogParser, LogParserLike } from "./LogParser.class.js";

// CONSTANTS
const kDurationTransformer = (value: string | number) => utils.durationToUnixTimestamp(value);
const kAutoURLGrafanaTransformer = {
  start: kDurationTransformer,
  end: kDurationTransformer
};

export interface LokiQueryAPIOptions {
  /**
   * @default 100
   */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
}

export interface LokiQueryOptions<T> extends LokiQueryAPIOptions {
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

export interface LokiDatasource {
  id: number;
  uid: string;
  orgId: number;
  name: string;
  type: string;
  typeName?: string;
  typeLogoUrl: string;
  access: string;
  url: string;
  password?: string;
  user: string;
  database: string;
  basicAuth: boolean;
  basicAuthUser?: string;
  basicAuthPassword?: string;
  withCredentials?: boolean;
  isDefault: boolean;
  jsonData?: {
    authType?: string;
    defaultRegion?: string;
    logLevelField?: string;
    logMessageField?: string;
    timeField?: string;
    maxConcurrentShardRequests?: number;
    maxLines?: number;
    graphiteVersion?: string;
    graphiteType?: string;
  };
  secureJsonFields?: {
    basicAuthPassword?: boolean;
  };
  version?: number;
  readOnly: boolean;
}

export interface LokiLabelValuesOptions extends LokiLabelsOptions {
  /**
   * A set of log stream selector that selects the streams to match and return label values for <name>.
   *
   * Example: {"app": "myapp", "environment": "dev"}
   */
  query?: string;
}

export interface QueryRangeResponse<T> {
  values: T[];
  timerange: utils.TimeRange | null;
}

export interface QueryRangeStreamResponse<T> {
  logs: LokiStreamResult<T>[];
  timerange: utils.TimeRange | null;
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

  #fetchQueryRange<T>(
    logQL: string,
    options: LokiQueryAPIOptions = {}
  ): Promise<httpie.RequestResponse<RawQueryRangeResponse<T>>> {
    const { limit = 100 } = options;

    /**
     * @see https://grafana.com/docs/loki/latest/api/#query-loki-over-a-range-of-time
     */
    const uri = autoURL(
      new URL("loki/api/v1/query_range", this.remoteApiURL),
      { ...options, limit, query: logQL },
      kAutoURLGrafanaTransformer
    );

    return httpie.get<RawQueryRangeResponse<T>>(
      uri, this.httpOptions
    );
  }

  async queryRangeStream<T = string>(
    logQL: string,
    options: LokiQueryOptions<T> = {}
  ): Promise<QueryRangeStreamResponse<T>> {
    const { parser = new NoopLogParser<T>() } = options;

    const { data } = await this.#fetchQueryRange<LokiStream>(logQL, options);

    return {
      logs: data.data.result.map((result) => {
        return {
          stream: result.stream,
          values: result.values.flatMap(([, log]) => parser.executeOnLogs([log]))
        };
      }),
      timerange: utils.queryRangeStreamTimeRange(data.data.result)
    };
  }

  async queryRange<T = string>(
    logQL: string,
    options: LokiQueryOptions<T> = {}
  ): Promise<QueryRangeResponse<T>> {
    const { parser = new NoopLogParser<T>() } = options;

    const { data } = await this.#fetchQueryRange<LokiMatrix | LokiStream>(logQL, options);

    const inlinedLogs = utils.inlineLogs(data);
    if (inlinedLogs === null) {
      return {
        values: [], timerange: null
      };
    }

    return {
      values: parser.executeOnLogs(inlinedLogs.values),
      timerange: inlinedLogs.timerange
    };
  }

  async datasources(): Promise<LokiDatasource[]> {
    const uri = new URL("/api/datasources", this.remoteApiURL);

    const { data } = await httpie.get<LokiDatasource[]>(uri, this.httpOptions);

    return data;
  }

  async datasourceById(id: string | number): Promise<LokiDatasource> {
    const uri = new URL(`/api/datasources/${id}`, this.remoteApiURL);

    const { data } = await httpie.get<LokiDatasource>(uri, this.httpOptions);

    return data;
  }

  async datasourceByName(name: string): Promise<LokiDatasource> {
    const uri = new URL(`/api/datasources/name/${name}`, this.remoteApiURL);

    const { data } = await httpie.get<LokiDatasource>(uri, this.httpOptions);

    return data;
  }

  async datasourceByUid(uid: string): Promise<LokiDatasource> {
    const uri = new URL(`/api/datasources/uid/${uid}`, this.remoteApiURL);

    const { data } = await httpie.get<LokiDatasource>(uri, this.httpOptions);

    return data;
  }

  async datasourceIdByName(name: string): Promise<LokiDatasource> {
    const uri = new URL(`/api/datasources/id/${name}`, this.remoteApiURL);

    const { data } = await httpie.get<LokiDatasource>(uri, this.httpOptions);

    return data;
  }

  async labels(options: LokiLabelsOptions = {}): Promise<string[]> {
    const uri = autoURL(
      new URL("loki/api/v1/labels", this.remoteApiURL),
      options,
      kAutoURLGrafanaTransformer
    );

    const { data: labels } = await httpie.get<LabelResponse>(
      uri, this.httpOptions
    );

    return labels.data;
  }

  async labelValues(label: string, options: LokiLabelValuesOptions = {}): Promise<string[]> {
    const uri = autoURL(
      new URL(`loki/api/v1/label/${label}/values`, this.remoteApiURL),
      options,
      kAutoURLGrafanaTransformer
    );

    const { data: labelValues } = await httpie.get<LabelValuesResponse>(
      uri, this.httpOptions
    );

    return labelValues.data;
  }
}
