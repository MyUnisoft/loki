// Import Node.js Dependencies
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "@myunisoft/httpie";

// Import Internal Dependencies
import { GrafanaLoki, LokiDatasource } from "../src/class/GrafanaLoki.class.js";
import { LogParser } from "../src/class/LogParser.class.js";
import { LokiStandardBaseResponse, RawQueryRangeResponse } from "../src/types.js";

// CONSTANTS
const kDummyURL = "https://nodejs.org";

const kDefaultDispatcher = getGlobalDispatcher();
const kMockAgent = new MockAgent();
kMockAgent.disableNetConnect();
const kMockDatasource: LokiDatasource = {
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

describe("GrafanaLoki", () => {
  describe("constructor", () => {
    beforeEach(() => {
      delete process.env.GRAFANA_API_TOKEN;
    });

    it("should throw an Error if no api token is provided", () => {
      const expectedError = {
        name: "Error",
        message: "An apiToken must be provided to use the Grafana Loki API"
      };

      assert.throws(() => {
        new GrafanaLoki({ remoteApiURL: kDummyURL });
      }, expectedError);
    });

    it("should load token from ENV if no apiToken argument is provided", () => {
      const apiToken = crypto.randomBytes(4).toString("hex");
      process.env.GRAFANA_API_TOKEN = apiToken;

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });
      assert.deepEqual(sdk.httpOptions, {
        headers: {
          authorization: `Bearer ${apiToken}`
        }
      });
    });

    it("should load token from apiToken constructor option argument", () => {
      const apiToken = crypto.randomBytes(4).toString("hex");

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL, apiToken });
      assert.deepEqual(sdk.httpOptions, {
        headers: {
          authorization: `Bearer ${apiToken}`
        }
      });
    });
  });

  describe("queryRange", () => {
    const agentPoolInterceptor = kMockAgent.get(kDummyURL);

    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
      setGlobalDispatcher(kMockAgent);
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
      setGlobalDispatcher(kDefaultDispatcher);
    });

    it("should return expectedLogs with no modification (using NoopParser)", async() => {
      const expectedLogs = ["hello world", "foobar"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRange("{app='foo'}");
      assert.deepEqual(
        result.values,
        expectedLogs.slice(0).reverse()
      );
    });

    it("should return expectedLogs with no modification (using NoopParser, queryRangeStream)", async() => {
      const expectedLogs = ["hello world", "foobar"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRangeStream("{app='foo'}");

      assert.deepEqual(
        result.logs[0].values,
        expectedLogs.slice(0)
      );
      assert.deepEqual(result.logs[0].stream, { foo: "bar" });
    });

    it("should return empty list of logs (using NoopParser, queryRangeStream)", async() => {
      const expectedLogs = [];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRangeStream("{app='foo'}");

      assert.deepEqual(
        result.logs,
        expectedLogs
      );
    });

    it("should use the provided parser to transform logs", async() => {
      const expectedLogs = ["hello 'Thomas'"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRange<{ name: string }>("{app='foo'}", {
        parser: new LogParser("hello '<name:alphanum>'")
      });
      assert.strictEqual(result.values.length, 1);
      assert.deepEqual(
        result.values[0],
        { name: "Thomas" }
      );
    });

    it("should use the provided parser to transform logs (queryRangeStream)", async() => {
      const expectedLogs = ["hello 'Thomas'"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRangeStream<{ name: string }>("{app='foo'}", {
        parser: new LogParser("hello '<name:alphanum>'")
      });

      assert.strictEqual(result.logs.length, 1);
      assert.deepEqual(
        result.logs[0].values[0],
        { name: "Thomas" }
      );
      assert.deepEqual(result.logs[0].stream, { foo: "bar" });
    });

    it("should return empty list of logs (using LogParser, queryRangeStream)", async() => {
      const expectedLogs = [];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRangeStream<{ name: string }>("{app='foo'}", {
        parser: new LogParser("hello '<name:alphanum>'")
      });

      assert.deepEqual(
        result.logs,
        expectedLogs
      );
    });
  });

  describe("datasources", () => {
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasources();
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasources();
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasourceById(1);
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasourceById("1");
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasourceByName("Loki");
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasourceByUid("303030xGz");
      assert.deepEqual(
        result,
        expectedDatasources
      );
    });

    it("should return datasource id by name", async() => {
      const expectedDatasources = kMockDatasource.id;
      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("/api/datasources/id/Loki")
        })
        .reply(200, String(kMockDatasource.id), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.datasourceIdByName("Loki");
      assert.deepEqual(
        result,
        expectedDatasources
      );
    });
  });

  describe("labels", () => {
    const agentPoolInterceptor = kMockAgent.get(kDummyURL);

    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
      setGlobalDispatcher(kMockAgent);
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
      setGlobalDispatcher(kDefaultDispatcher);
    });

    it("should return labels", async() => {
      const expectedLabels = ["app", "env"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/labels")
        })
        .reply(200, mockLabelResponse("success", expectedLabels), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.labels();
      assert.deepEqual(
        result,
        expectedLabels
      );
    });

    it("should return label values", async() => {
      const expectedLabelValues = ["prod", "preprod"];
      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/label/env/values")
        })
        .reply(200, mockLabelResponse("success", expectedLabelValues), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.labelValues("env");
      assert.deepEqual(
        result,
        expectedLabelValues
      );
    });
  });

  describe("series", () => {
    const agentPoolInterceptor = kMockAgent.get(kDummyURL);

    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
      setGlobalDispatcher(kMockAgent);
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
      setGlobalDispatcher(kDefaultDispatcher);
    });

    it("should return series if response status is success", async() => {
      const expectedSeries = [
        {
          app: "creditbail",
          foo: "bar"
        }
      ];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/series")
        })
        .reply(200, mockLabelResponse("success", expectedSeries), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.series(`{env="production"}`);
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);

      assert.deepEqual(
        result,
        expectedSeries
      );
    });

    it("should return empty array if response status is failed", async() => {
      const expectedSeries = [
        {
          app: "creditbail",
          foo: "bar"
        }
      ];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/series")
        })
        .reply(200, mockLabelResponse("failed", expectedSeries), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.series(`{env="production"}`);
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });
  });
});

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

function mockStreamResponse(logs: string[]): DeepPartial<RawQueryRangeResponse> {
  return {
    status: "success",
    data: {
      resultType: "streams",
      result: logs.length > 0 ? [
        {
          stream: { foo: "bar" },
          values: logs.map((log) => [getNanoSecTime(), log])
        }
      ] : [],
      stats: {}
    }
  };
}

function mockLabelResponse<T>(
  status: "success" | "failed",
  response: T[]
): LokiStandardBaseResponse<T[]> {
  return {
    status,
    data: response
  };
}

function getNanoSecTime() {
  const hrTime = process.hrtime();

  return String((hrTime[0] * 1000000000) + hrTime[1]);
}

