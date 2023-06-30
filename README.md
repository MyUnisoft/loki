<p align="center"><h1 align="center">
  Loki
</h1></p>

<p align="center">
  Node.js Grafana Loki SDK
</p>

<p align="center">
    <a href="https://github.com/MyUnisoft/loki"><img src="https://img.shields.io/github/package-json/v/MyUnisoft/loki?style=flat-square" alt="npm version"></a>
    <a href="https://github.com/MyUnisoft/loki"><img src="https://img.shields.io/github/license/MyUnisoft/loki?style=flat-square" alt="license"></a>
    <a href="https://github.com/MyUnisoft/loki"><img src="https://img.shields.io/github/languages/code-size/MyUnisoft/loki?style=flat-square" alt="size"></a>
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
import GrafanaLokiSDK from "../dist/index.js";

const api = new GrafanaLokiSDK({
  // Note: if not provided, it will load process.env.GRAFANA_API_TOKEN
  apiToken: "...",
  remoteApiURL: "https://name.loki.com"
});

const logs = await api.queryRange(
  `{app="serviceName", env="production"}`,
  {
    range: "1d",
    limit: 200
  }
);
console.log(logs);
```

## API
TBC

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
