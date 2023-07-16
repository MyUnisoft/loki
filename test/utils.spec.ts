// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/utils.js";

describe("utils.durationToUnixTimestamp", () => {
  it("should return the number as string without any conversion", () => {
    assert.strictEqual(
      utils.durationToUnixTimestamp(10),
      "10"
    );
  });
});
