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
   * */
  limit?: number;
  start?: number | string;
  end?: number | string;
  since?: string;
  parser?: LogParserLike<T>;
}
```

<em>start</em> and <em>end</em> arguments can be either a unix timestamp or a duration like `6h`.

## API

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

The parser will automatically escape and generate a RegExp with capture group (with a syntax similar to Loki pattern).

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fraxken"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Thomas.G"/><br /><sub><b>Thomas.G</b></sub></a><br /><a href="https://github.com/MyUnisoft/loki/commits?author=fraxken" title="Code">💻</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/MyUnisoft/loki/commits?author=fraxken" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
