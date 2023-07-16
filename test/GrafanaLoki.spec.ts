// Import Node.js Dependencies
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "@myunisoft/httpie";

// Import Internal Dependencies
import { GrafanaLoki } from "../src/class/GrafanaLoki.class.js";
import { LogParser } from "../src/class/LogParser.class.js";
import { QueryRangeResponse } from "../src/types.js";

// CONSTANTS
const kDummyURL = "https://nodejs.org";

const kDefaultDispatcher = getGlobalDispatcher();
const kMockAgent = new MockAgent();
kMockAgent.disableNetConnect();

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
        result,
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

      const sdk = new GrafanaLoki({ remoteApiURL: kDummyURL });

      const result = await sdk.queryRange<{ name: string }>("{app='foo'}", {
        parser: new LogParser("hello '<name:alphanum>'")
      });
      assert.strictEqual(result.length, 1);
      assert.deepEqual(
        result[0],
        { name: "Thomas" }
      );
    });
  });
});

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

function mockStreamResponse(logs: string[]): DeepPartial<QueryRangeResponse> {
  return {
    status: "success",
    data: {
      resultType: "streams",
      result: [
        {
          stream: {},
          values: logs.map((log) => [getNanoSecTime(), log])
        }
      ],
      stats: {}
    }
  };
}

function getNanoSecTime() {
  const hrTime = process.hrtime();

  return String((hrTime[0] * 1000000000) + hrTime[1]);
}

