// Import Node.js Dependencies
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Import Internal Dependencies
import { ApiCredential } from "../src/class/ApiCredential.class.js";

describe("ApiCredential", () => {
  describe("httpOptions getter", () => {
    it("should return the bearer token provided in the constructor", () => {
      const bearerAuth = {
        type: "bearer" as const,
        token: crypto.randomBytes(4).toString("hex")
      };

      const sdk = new ApiCredential(bearerAuth);
      assert.deepEqual(
        sdk.httpOptions,
        {
          headers: {
            authorization: ApiCredential.buildAuthorizationHeader(bearerAuth)
          }
        }
      );
    });

    it("should return classic authentication (username and password) provided in the constructor as base64", () => {
      const classicAuth = {
        type: "classic" as const,
        username: "foo",
        password: "bar"
      };

      const sdk = new ApiCredential(classicAuth);
      assert.deepEqual(
        sdk.httpOptions,
        {
          headers: {
            authorization: ApiCredential.buildAuthorizationHeader(classicAuth)
          }
        }
      );
    });

    it("should return custom authentication provided in the constructor", () => {
      const authorization = "hello world";
      const classicAuth = {
        type: "custom" as const,
        authorization
      };

      const sdk = new ApiCredential(classicAuth);
      assert.deepEqual(
        sdk.httpOptions,
        {
          headers: {
            authorization
          }
        }
      );
    });

    it("should inject User-Agent header", () => {
      const token = crypto.randomBytes(4).toString("hex");
      const userAgent = "my-super-agent";

      const sdk = new ApiCredential({
        type: "bearer",
        token
      }, userAgent);

      assert.deepEqual(sdk.httpOptions, {
        headers: {
          authorization: `Bearer ${token}`,
          "User-Agent": userAgent
        }
      });
    });

    it("should return empty headers if no authentication methods is provided", () => {
      const sdk = new ApiCredential();
      assert.deepEqual(sdk.httpOptions, {
        headers: {}
      });
    });
  });
});
