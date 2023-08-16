<p align="center"><h1 align="center">
  Loki
</h1></p>

<p align="center">
  Node.js Grafana Loki SDK (WIP)
</p>

<p align="center">
    <a href="https://github.com/MyUnisoft/loki">
      <img src="https://img.shields.io/github/package-json/v/MyUnisoft/loki?style=for-the-badge" alt="npm version">
    </a>
    <a href="https://github.com/MyUnisoft/loki">
      <img src="https://img.shields.io/github/license/MyUnisoft/loki?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/MyUnisoft/loki">
      <img src="https://api.securityscorecards.dev/projects/github.com/MyUnisoft/loki/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/MyUnisoft/loki/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/MyUnisoft/loki/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
    <a href="https://github.com/MyUnisoft/loki">
      <img src="https://img.shields.io/github/languages/code-size/MyUnisoft/loki?style=for-the-badge" alt="size">
    </a>
</p>

## 🚧 Requirements

- [Node.js](https://nodejs.org/en/) version 16 or higher

## 🚀 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://doc.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com)

```bash
$ npm i @myunisoft/loki
# or
$ yarn add @myunisoft/loki
```

## 📚 Usage

```ts
import { GrafanaLoki } from "@myunisoft/loki";

const api = new GrafanaLoki({
  // Note: if not provided, it will load process.env.GRAFANA_API_TOKEN
  apiToken: "...",
  remoteApiURL: "https://name.loki.com"
});

const logs = await api.queryRange(
  `{app="serviceName", env="production"}`,
  {
    start: "1d",
    limit: 200
  }
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
  parser?: LogParserLike<T>;
}
```

<em>start</em> and <em>end</em> arguments can be either a unix timestamp or a duration like `6h`.

## API

### queryRange

You can provide a custom parser to queryRange (by default it inject a NoopParser doing nothing).

```ts
import { LogParser } from "@myunisoft/loki";

interface CustomParser {
  date: string;
  requestId: string;
  endpoint: string;
  method: string;
  statusCode: number;
}

const customParser = new LogParser<CustomParser>(
  "<date>: [req-<requestId:word>] <endpoint> <method:httpMethod> <statusCode:httpStatusCode>"
);

const logs = await api.queryRange(
  `{app="serviceName", env="production"}`,
  {
    parser: customParser
  }
);
for (const data of logs) {
  console.log(`requestId: ${data.requestId}`);
}
```

### queryRangeStream

Same as `queryRange` but returns the labels key-value pairs stream

```ts
const customParser = new LogParser<CustomParser>(
  "<date>: [req-<requestId:word>] <endpoint> <method:httpMethod> <statusCode:httpStatusCode>"
);

const logs = await api.queryRangeStream(
  `{app="serviceName", env="production"}`,
);
for (const { stream, values } of logs) {
  // Record<string, string>
  console.log(stream);
  // string[]
  console.log(values);
}

interface LokiStreamResult<T = string> {
  stream: Record<string, string>;
  values: T[];
}
```

### datasources

```ts
interface LokiDatasource {
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
```

```ts
const datasources = await api.datasources();
```

`datasources()` retrieves all datasources.

### datasourceById

```ts
const datasource = await api.datasourceById(1);
// or
const datasource = await api.datasourceById("1");
```

`datasourceById(id: number | string)` retrieves a single datasource given it's id.

### datasourceByName

```ts
const datasource = await api.datasourceByName("Loki");
```

`datasourceByName(name: string)` retrieves a single datasource given it's name.

### datasourceByUid

```ts
const datasource = await api.datasourceByUid("303030xGz");
```

`datasourceByUid(name: string)` retrieves a single datasources given it's uid.

### datasourceIdByName

```ts
const id = await api.datasourceIdByName("Loki");
```

`datasourceIdByName(name: string)` retrieves datasource id given it's name.

### labels

```ts
const labels = await api.labels();
```

`labels(options = {})` retrieves the list of known labels within a given time span. Loki may use a larger time span than the one specified. It accepts the following options:

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

### labelValues

```ts
const appLabelValues = await api.labelValues("app");
```

`labelValues(label, options = {})` retrieves the list of known values for a given label within a given time span. Loki may use a larger time span than the one specified.

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

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fraxken"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Thomas.G"/><br /><sub><b>Thomas.G</b></sub></a><br /><a href="https://github.com/MyUnisoft/loki/commits?author=fraxken" title="Code">💻</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/MyUnisoft/loki/commits?author=fraxken" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/MyUnisoft/loki/commits?author=PierreDemailly" title="Code">💻</a> <a href="https://github.com/MyUnisoft/loki/commits?author=PierreDemailly" title="Tests">⚠️</a> <a href="https://github.com/MyUnisoft/loki/commits?author=PierreDemailly" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
