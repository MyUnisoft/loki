// Import Internal Dependencies
import { ApiCredential } from "./ApiCredential.class.js";
import {
  Datasources,
  Datasource
} from "./Datasources.class.js";
import {
  Loki,
  LokiLabelValuesOptions,
  LokiLabelsOptions,
  LokiQueryOptions
} from "./Loki.class.js";

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

export class GrafanaApi {
  private remoteApiURL: URL;
  private credential: ApiCredential;

  public Datasources: Datasources;
  public Loki: Loki;

  constructor(options: GrafanaApiOptions) {
    const { apiToken, userAgent, remoteApiURL } = options;

    this.credential = new ApiCredential(apiToken, userAgent);
    this.remoteApiURL = typeof remoteApiURL === "string" ?
      new URL(remoteApiURL) :
      remoteApiURL;

    // Initiate sub-class API
    this.Datasources = new Datasources(
      this.remoteApiURL,
      this.credential
    );
    this.Loki = new Loki(
      this.remoteApiURL,
      this.credential
    );
  }
}

export type {
  Datasource,
  LokiLabelValuesOptions,
  LokiLabelsOptions,
  LokiQueryOptions
};
