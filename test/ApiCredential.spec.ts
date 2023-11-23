// Import Node.js Dependencies
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Import Internal Dependencies
import { ApiCredential } from "../src/class/ApiCredential.class.js";

describe("ApiCredential", () => {
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
        new ApiCredential();
      }, expectedError);
    });
  });

  describe("httpOptions getter", () => {
    it("should return apiToken provided in the constructor", () => {
      const apiToken = crypto.randomBytes(4).toString("hex");

      const sdk = new ApiCredential(apiToken);
      assert.deepEqual(sdk.httpOptions, {
        headers: {
          authorization: `Bearer ${apiToken}`
        }
      });
    });
  });
});
