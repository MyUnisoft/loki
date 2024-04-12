<p align="center"><h1 align="center">
  Loki
</h1></p>

<p align="center">
  Node.js Grafana API SDK (Loki, Datasources ..)
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

- [Node.js](https://nodejs.org/en/) version 18 or higher

## 🚀 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://doc.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com)

```bash
$ npm i @myunisoft/loki
# or
$ yarn add @myunisoft/loki
```

## 📚 Usage

```ts
import { GrafanaApi } from "@myunisoft/loki";
import { LogQL, StreamSelector } from "@sigyn/logql";

const api = new GrafanaApi({
  // Note: if not provided, it will load process.env.GRAFANA_API_TOKEN
  apiToken: "...",
  remoteApiURL: "https://name.loki.com"
});

const ql = new LogQL(
  new StreamSelector({ app: "serviceName", env: "production" })
);
const logs = await api.Loki.queryRange(
  ql, // or string `{app="serviceName", env="production"}`
  {
    start: "1d",
    limit: 200
  }
);
console.log(logs);
```

You can also provide a Loki pattern to automatically parse logs (and infer the right type with TypeScript)

```ts
const logs = await api.Loki.queryRange(
  `{app="serviceName", env="production"}`
  {
    pattern: "<verb> <_> <endpoint>"
  }
);
for (const { verb, endpoint } of logs) {
  console.log({verb, endpoint });
}
```

## API

### GrafanaAPI

```ts
export interface GrafanaApiOptions {
  /**
   * Grafana API Token
   */
  apiToken?: string;
  /**
   * User-agent HTTP header to forward to Grafana/Loki API
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agents
   */
  userAgent?: string;
  /**
   * Remote Grafana root API URL
   */
  remoteApiURL: string | URL;
}
```

### Sub-class

- [Loki](./docs/Loki.md)
- [Datasources](./docs/Datasources.md)

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
