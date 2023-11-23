// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";

// Import Internal Dependencies
import { ApiCredential } from "./ApiCredential.class.js";

export interface Datasource {
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

export class Datasources {
  private remoteApiURL: URL;
  private credential: ApiCredential;

  constructor(
    remoteApiURL: URL,
    credential: ApiCredential
  ) {
    this.remoteApiURL = remoteApiURL;
    this.credential = credential;
  }

  async all(): Promise<Datasource[]> {
    const uri = new URL(
      "/api/datasources",
      this.remoteApiURL
    );

    const { data } = await httpie.get<Datasource[]>(
      uri,
      this.credential.httpOptions
    );

    return data;
  }

  async byId(
    id: string | number
  ): Promise<Datasource> {
    const uri = new URL(
      `/api/datasources/${id}`,
      this.remoteApiURL
    );

    const { data } = await httpie.get<Datasource>(
      uri,
      this.credential.httpOptions
    );

    return data;
  }

  async byName(
    name: string
  ): Promise<Datasource> {
    const uri = new URL(
      `/api/datasources/name/${name}`,
      this.remoteApiURL
    );

    const { data } = await httpie.get<Datasource>(
      uri,
      this.credential.httpOptions
    );

    return data;
  }

  async byUID(
    uid: string
  ): Promise<Datasource> {
    const uri = new URL(
      `/api/datasources/uid/${uid}`,
      this.remoteApiURL
    );

    const { data } = await httpie.get<Datasource>(
      uri,
      this.credential.httpOptions
    );

    return data;
  }

  async idByName(
    name: string
  ): Promise<number> {
    const uri = new URL(
      `/api/datasources/id/${name}`,
      this.remoteApiURL
    );

    const { data } = await httpie.get<{ id: number }>(
      uri,
      this.credential.httpOptions
    );

    return data.id;
  }
}
