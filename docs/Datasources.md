# Grafana Datasources API

https://grafana.com/docs/grafana/latest/developers/http_api/data_source/

API are accessible from the `Datasources` property.

```ts
import { GrafanaApi } from "@myunisoft/loki";

const api = new GrafanaApi({
  remoteApiURL: "https://name.loki.com"
});

await api.Datasources.all();
```

Datasource is described by the following TypeScript interface
```ts
interface Datasource {
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

## API

### all(): Promise< Datasource[] >
retrieves all datasources.

```ts
const datasources = await api.Datasources.all();
```

### byId(id: number | string): Promise< Datasource >
retrieves a single datasource given it's id.

```ts
const datasource = await api.Datasources.byId(1);
// or
const datasource = await api.Datasources.byId("1");
```

### byName(name: string): Promise< Datasource >
retrieves a single datasource given it's name.

```ts
const datasource = await api.Datasources.byName("Loki");
```

### byUID(name: string): Promise< Datasource >
retrieves a single datasources given it's uid.

```ts
const datasource = await api.Datasources.byUID("303030xGz");
```

### idByName(name: string): Promise< Datasource >
retrieves datasource id given it's name.

```ts
const id = await api.Datasources.idByName("Loki");
```
