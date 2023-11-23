// Import Node.js Dependencies
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Import Internal Dependencies
import { GrafanaApi } from "../src/index.js";
import { Datasources } from "../src/class/Datasources.class.js";
import { Loki } from "../src/class/Loki.class.js";

// CONSTANTS
const remoteApiURL = "https://nodejs.org";

describe("GrafanaApi", () => {
  describe("constructor", () => {
    beforeEach(() => {
      delete process.env.GRAFANA_API_TOKEN;
    });

    it("should instanciate sub-API", () => {
      const api = new GrafanaApi({
        remoteApiURL,
        apiToken: "foobar"
      });

      assert.ok(api.Datasources instanceof Datasources);
      assert.ok(api.Loki instanceof Loki);
    });

    it("should throw an Error if no api token is provided", () => {
      const expectedError = {
        name: "Error",
        message: "API token must be provided to use the Grafana API"
      };

      assert.throws(() => {
        new GrafanaApi({ remoteApiURL });
      }, expectedError);
    });

    it("should load token from ENV if no token argument is provided", () => {
      const apiToken = crypto.randomBytes(4).toString("hex");
      process.env.GRAFANA_API_TOKEN = apiToken;

      assert.doesNotThrow(() => new GrafanaApi({ remoteApiURL }));
    });

    it("should load token from apiToken constructor option argument", () => {
      const apiToken = crypto.randomBytes(4).toString("hex");

      assert.doesNotThrow(() => new GrafanaApi({ remoteApiURL, apiToken }));
    });
  });
});

