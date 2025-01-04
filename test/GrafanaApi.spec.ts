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
    it("should instanciate sub-API", () => {
      const api = new GrafanaApi({
        remoteApiURL
      });

      assert.ok(api.Datasources instanceof Datasources);
      assert.ok(api.Loki instanceof Loki);
    });

    it("should load constructor with authentication and bearer token", () => {
      const token = crypto.randomBytes(4).toString("hex");

      assert.doesNotThrow(() => new GrafanaApi({
        remoteApiURL,
        authentication: {
          type: "bearer",
          token
        }
      }));
    });

    it("should load constructor with a classic authentication", () => {
      assert.doesNotThrow(() => new GrafanaApi({
        remoteApiURL,
        authentication: {
          type: "classic",
          username: "foo",
          password: "bar"
        }
      }));
    });

    it("should load constructor with a custom authentication", () => {
      assert.doesNotThrow(() => new GrafanaApi({
        remoteApiURL,
        authentication: {
          type: "custom",
          authorization: "hello world"
        }
      }));
    });
  });
});

