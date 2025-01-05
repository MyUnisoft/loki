# Grafana Loki API

https://grafana.com/docs/loki/latest/reference/api/

API are accessible from the `Loki` property.

```ts
import { GrafanaApi } from "@myunisoft/loki";

const api = new GrafanaApi({
  remoteApiURL: "https://name.loki.com"
});

await api.Loki.series(`{env="production"}`);
```

Note that a TimeRange is defined as follows:

```ts
export type TimeRange = [first: number, last: number];
```

## API

### queryRange< T = string >(logQL: LogQL | string, options?: LokiQueryStreamOptions< T >): Promise< QueryRangeResponse< T > >

The `queryRange` method returns raw logs (without timestamp or metric/stream labels).

You can provide a custom parser to queryRange (by default it injects a **NoopParser** doing nothing).

```ts
const logs = await api.Loki.queryRange(
  `{app="serviceName", env="production"}`
);
console.log(logs);
```

#### options

The queryRange options are described by the following TypeScript interface:

```ts
interface LokiQueryOptions {
  /**
   * @default 100
   */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
}

interface LokiQueryStreamOptions<T extends LokiPatternType> extends LokiQueryOptions {
  pattern?: T;
}
```

<em>start</em> and <em>end</em> arguments can be either a Unix timestamp or a duration like `6h`.

#### response

The response is described by the following interface:
```ts
interface QueryRangeLogsResponse<T extends LokiPatternType> {
  logs: LokiLiteralPattern<T>[];
  timerange: TimeRange | null;
}
```

`timerange` is **null** when there are no logs available with the given LogQL.

> [!CAUTION]
> When you use an incorrect pattern, any logs that are not correctly parsed will be removed from the result.

### queryRangeStream< T = string >(logQL: LogQL | string, options?: LokiQueryStreamOptions< T >): Promise< QueryRangeStreamResponse< T > >

Same as `queryRange` but returns the labels key-value pairs stream

```ts
const logs = await api.Loki.queryRangeStream(
  `{app="serviceName", env="production"}`,
);
for (const { stream, values } of logs) {
  // Record<string, string>
  console.log(stream);
  // [unixEpoch: number, value: T][]
  console.log(values);
}
```

#### response

The response is described by the following interface:
```ts
interface LokiCombined<T = string> {
  labels: LokiLabels;
  values: [unixEpoch: number, log: T][];
}

interface QueryRangeStreamResponse<T extends LokiPatternType> {
  streams: LokiCombined<LokiLiteralPattern<T>>[];
  timerange: TimeRange | null;
}
```

### queryRangeMatrix(logQL: LogQL | string, options?: LokiQueryBaseOptions): Promise< QueryRangeMatrixResponse >

Similar to `queryRange`, but it returns the labels' key-value pairs as metrics. Note that the matrix does not include patterns and values are returned as strings.

This method can only be used with [metric queries](https://grafana.com/docs/loki/latest/query/metric_queries/). Here is an example:

```
count_over_time({ label="value" }[5m])
```

#### response

The response is described by the following interface:

```ts
interface LokiCombined<T = string> {
  labels: LokiLabels;
  values: [unixEpoch: number, log: T][];
}

interface QueryRangeMatrixResponse {
  metrics: LokiCombined<string>[];
  timerange: TimeRange | null;
}
```

### labels(options?: LokiLabelsOptions): Promise< string[] >
retrieves the list of known labels within a given time span. Loki may use a larger time span than the one specified.

```ts
const labels = await api.labels();
```

It accepts the following options:

```ts
interface LokiLabelsOptions {
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
```

### labelValues(label: string, options?: LokiLabelValueOptions): Promise< string[] >
retrieves the list of known values for a given label within a given time span. Loki may use a larger time span than the one specified.

```ts
const appLabelValues = await api.Loki.labelValues("app");
```

It accepts the following options:

```ts
interface LokiLabelValueOptions {
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
  /**
   * A set of log stream selector that selects the streams to match and return label values for <name>.
   *
   * Example: {"app": "myapp", "environment": "dev"}
   */
  query?: string;
}
```

### series(match: StreamSelector | string)

Returns the list of time series that match a certain label set.

```ts
const series = await api.Loki.series(`{env="production"}`);
```

Full definition of the class method (it can take one or many StreamSelector)
```
async series<T = Record<string, string>>(
  ...match: [StreamSelector | string, ...(StreamSelector | string)[]]
): Promise<T[]>
```

### push(logs: Iterable< LokiIngestLogs >): Promise< void >
Send log entries to Loki.

```ts
const logs: LokiIngestLogs[] = [
  {
    stream: { app: "foo" },
    values: [["173532887432100000", "hello world"]]
  }
];
await api.Loki.push(logs);
```

The `LokiIngestLogs` type is defined as follows:

```ts
export type LogEntry = [unixEpoch: string, log: string];
export type LogEntryWithMetadata = [unixEpoch: string, log: string, metadata: Record<string, string>];

export interface LokiIngestLogs {
  stream: Record<string, string | number | boolean>;
  values: (LogEntry | LogEntryWithMetadata)[];
}
```

> [!IMPORTANT]
> The unixEpoch must be in **nanoseconds**

## Pattern usage

**queryRange** and **queryRangeStream** APIs allow the usage of pattern.

```ts
import { GrafanaApi } from "@myunisoft/loki";

const api = new GrafanaApi({
  remoteApiURL: "https://name.loki.com"
});

await api.Loki.queryRange("...", {
  pattern: "<pattern> <here>"
});

// or use an Array (tuple)
await api.Loki.queryRange("...", {
  pattern: [
    "<pattern> ",
    "<here>
  ] as const
});
```
