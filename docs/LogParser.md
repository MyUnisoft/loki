# LogParser

> [!CAUTION]
> We are working on a new @sigyn/pattern package to replace this

The LogParser class make easy to parse/type logs

```ts
import { GrafanaApi, LogParser } from "@myunisoft/loki";

interface CustomParser {
  date: string;
  requestId: string;
  endpoint: string;
  method: string;
  statusCode: number;
}

const parser = new LogParser<CustomParser>(
  "<date>: [req-<requestId:word>] <endpoint> <method:httpMethod> <statusCode:httpStatusCode>"
);

const api = new GrafanaApi({ });
const logs = await api.Loki.queryRange(
  `{app="serviceName", env="production"}`,
  {
    parser
  }
);
for (const data of logs) {
  console.log(`requestId: ${data.requestId}`);
}
```

## Fields

```ts
const kAvailableRegExField: Record<string, RegExField> = {
  all: {
    pattern: ".*", id: kNoopField
  },
  num: {
    pattern: "0-9", id: kOneOrManyField
  },
  numStar: {
    pattern: "0-9*", id: kOneOrManyField
  },
  ip: {
    pattern: "0-9.", id: kOneOrManyField
  },
  word: {
    pattern: "\\w", id: kOneOrManyField
  },
  httpMethod: {
    pattern: "GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS", id: kNoopField
  },
  httpStatusCode: {
    pattern: "0-9", id: (str) => `[${str}]{3}`
  },
  alphanum: {
    pattern: "a-zA-Z0-9", id: kOneOrManyField
  },
  string: {
    pattern: "_\\u00C0-\\u017F*\\w\\s-", id: kOneOrManyField
  }
};
```
