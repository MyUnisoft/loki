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

Note that a TimeRange is defined as following:
```ts
export type TimeRange = [first: number, last: number];
```

## API

### queryRange< T = string >(logQL: LogQL | string, options?: LokiQueryOptions< T >): Promise< QueryRangeResponse< T > >

Note that you can provide a custom parser to queryRange (by default it inject a NoopParser doing nothing).

```ts
const logs = await api.Loki.queryRange(
  `{app="serviceName", env="production"}`
);
console.log(logs);
```

queryRange options is described by the following TypeScript interface

```ts
export interface LokiQueryOptions<T> {
  /**
   * @default 100
   */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
  pattern?: T | Array<T> | ReadonlyArray<T>;
}
```

<em>start</em> and <em>end</em> arguments can be either a unix timestamp or a duration like `6h`.

The response is described by the following interface:
```ts
export interface QueryRangeResponse<T extends LokiPatternType> {
  values: LokiLiteralPattern<T>[];
  timerange: TimeRange | null;
}
```

### queryRangeStream< T = string >(logQL: LogQL | string, options?: LokiQueryOptions< T >): Promise< QueryRangeStreamResponse< T > >

Same as `queryRange` but returns the labels key-value pairs stream

```ts
const logs = await api.Loki.queryRangeStream(
  `{app="serviceName", env="production"}`,
);
for (const { stream, values } of logs) {
  // Record<string, string>
  console.log(stream);
  // string[]
  console.log(values);
}
```

The response is described by the following interface:
```ts
export interface QueryRangeStreamResponse<T extends LokiPatternType> {
  logs: LokiStreamResult<LokiLiteralPattern<T>>[];
  timerange: TimeRange | null;
}

interface LokiStreamResult<T = string> {
  stream: Record<string, string>;
  values: T[];
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

## Pattern usage
**queryRange** and **queryRangeStream** API allow the usage of pattern.

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
