// Import Node.js Dependencies
import { after, before, describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "@myunisoft/httpie";

// Import Internal Dependencies
import { GrafanaApi, Datasource } from "../src/index.js";

// CONSTANTS
const kDummyURL = "https://nodejs.org";

const kDefaultDispatcher = getGlobalDispatcher();
const kMockAgent = new MockAgent();
kMockAgent.disableNetConnect();
const kMockDatasource: Datasource = {
  id: 1,
  uid: "303030xGz",
  orgId: 1,
  name: "Loki",
  type: "loki",
  typeName: "Loki",
  typeLogoUrl: "public/app/plugins/datasource/loki/img/loki_icon.svg",
  access: "proxy",
  url: "http://localhost:3100",
  user: "",
  database: "",
  basicAuth: false,
  isDefault: false,
  jsonData: { maxLines: 1000 },
  readOnly: true
};

describe("GrafanaApi.DataSources", () => {
  const agentPoolInterceptor = kMockAgent.get(kDummyURL);

  before(() => {
    process.env.GRAFANA_API_TOKEN = "";
    setGlobalDispatcher(kMockAgent);
  });

  after(() => {
    delete process.env.GRAFANA_API_TOKEN;
    setGlobalDispatcher(kDefaultDispatcher);
  });

  it("should return all datasources", async() => {
    const expectedDatasources = [kMockDatasource];
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.all();
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return all datasources", async() => {
    const expectedDatasources = [kMockDatasource];
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.all();
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return datasource by id", async() => {
    const expectedDatasources = kMockDatasource;
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources/1")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.byId(1);
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return datasource by id (string)", async() => {
    const expectedDatasources = kMockDatasource;
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources/1")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.byId("1");
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return datasource by name", async() => {
    const expectedDatasources = kMockDatasource;
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources/name/Loki")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.byName("Loki");
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return datasource by uid", async() => {
    const expectedDatasources = kMockDatasource;
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources/uid/303030xGz")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.byUID("303030xGz");
    assert.deepEqual(
      result,
      expectedDatasources
    );
  });

  it("should return datasource id by name", async() => {
    const expectedDatasources = { id: kMockDatasource.id };
    agentPoolInterceptor
      .intercept({
        path: (path) => path.includes("/api/datasources/id/Loki")
      })
      .reply(200, expectedDatasources, {
        headers: { "Content-Type": "application/json" }
      });

    const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

    const result = await sdk.Datasources.idByName("Loki");
    assert.strictEqual(
      result,
      expectedDatasources.id
    );
  });
});
