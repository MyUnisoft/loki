// Import Node.js Dependencies
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "@myunisoft/httpie";

// Import Internal Dependencies
import {
  GrafanaApi,
  LokiStandardBaseResponse
} from "../src/index.js";
import { mockMatrixResponse, mockStreamResponse } from "./utils/logs.factory.js";

// CONSTANTS
const kDummyURL = "https://nodejs.org";

const kDefaultDispatcher = getGlobalDispatcher();
const kMockAgent = new MockAgent();
kMockAgent.disableNetConnect();

describe("GrafanaApi.Loki", () => {
  const agentPoolInterceptor = kMockAgent.get(kDummyURL);

  before(() => {
    setGlobalDispatcher(kMockAgent);
  });

  after(() => {
    setGlobalDispatcher(kDefaultDispatcher);
  });

  describe("constructor", () => {
    beforeEach(() => {
      delete process.env.GRAFANA_API_TOKEN;
    });

    it("should throw an Error if no api token is provided", () => {
      const expectedError = {
        name: "Error",
        message: "API token must be provided to use the Grafana API"
      };

      assert.throws(() => {
        new GrafanaApi({ remoteApiURL: kDummyURL });
      }, expectedError);
    });
  });

  describe("queryRangeMatrix", () => {
    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
    });

    it("should throw with a log query", async() => {
      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      await assert.rejects(
        () => sdk.Loki.queryRangeMatrix("{app='foo'}"),
        {
          name: "Error",
          message: "Log queries must use `queryRangeStream` method"
        }
      );
    });

    it("should return expectedLogs with no modification (NoopParser)", async() => {
      const expectedLogs = ["hello world", "foobar"];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockMatrixResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRangeMatrix("count_over_time({app='foo'} [5m])");
      const resultLogs = result.metrics[0]!;

      assert.ok(
        resultLogs.values.every((arr) => typeof arr[0] === "number")
      );
      assert.deepEqual(
        resultLogs.values.map((arr) => arr[1]),
        expectedLogs.slice(0)
      );
      assert.deepEqual(resultLogs.labels, { foo: "bar" });
    });
  });

  describe("queryRangeStream", () => {
    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
    });

    it("should throw with a metric query", async() => {
      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      await assert.rejects(
        () => sdk.Loki.queryRangeStream("count_over_time({app='foo'} [5m])"),
        {
          name: "Error",
          message: "Metric queries must use `queryRangeMatrix` method"
        }
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRangeStream("{app='foo'}", {
        pattern: "hello '<name>'"
      });
      const resultLogs = result.streams[0]!;

      assert.strictEqual(result.streams.length, 1);
      assert.deepEqual(
        resultLogs.values[0][1],
        { name: "Thomas" }
      );
      assert.deepEqual(resultLogs.labels, { foo: "bar" });
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRangeStream("{app='foo'}");
      const resultLogs = result.streams[0]!;

      assert.ok(
        resultLogs.values.every((arr) => typeof arr[0] === "number")
      );
      assert.deepEqual(
        resultLogs.values.map((arr) => arr[1]),
        expectedLogs.slice(0)
      );
      assert.deepEqual(resultLogs.labels, { foo: "bar" });
    });

    it("should return empty list of logs (using LogParser)", async() => {
      const expectedLogs = [];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRangeStream("{app='foo'}", {
        pattern: "hello '<name>'"
      });

      assert.deepEqual(
        result.streams,
        expectedLogs
      );
    });

    it("should return empty list of logs (using NoopParser)", async() => {
      const expectedLogs = [];

      agentPoolInterceptor
        .intercept({
          path: (path) => path.includes("loki/api/v1/query_range")
        })
        .reply(200, mockStreamResponse(expectedLogs), {
          headers: { "Content-Type": "application/json" }
        });

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRangeStream("{app='foo'}");

      assert.deepEqual(
        result.streams,
        expectedLogs
      );
    });
  });

  describe("queryRange", () => {
    before(() => {
      process.env.GRAFANA_API_TOKEN = "";
    });

    after(() => {
      delete process.env.GRAFANA_API_TOKEN;
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRange("{app='foo'}");
      assert.deepEqual(
        result.logs,
        expectedLogs.slice(0).reverse()
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.queryRange("{app='foo'}", {
        pattern: "hello '<name>'"
      });
      assert.strictEqual(result.logs.length, 1);
      assert.deepEqual(
        result.logs[0],
        { name: "Thomas" }
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.labels();
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.labelValues("env");
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.series(`{env="production"}`);
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

      const sdk = new GrafanaApi({ remoteApiURL: kDummyURL });

      const result = await sdk.Loki.series(`{env="production"}`);
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });
  });
});

function mockLabelResponse<T>(
  status: "success" | "failed",
  response: T[]
): LokiStandardBaseResponse<T[]> {
  return {
    status,
    data: response
  };
}
