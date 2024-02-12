// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import dayjs from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import * as utils from "../src/utils.js";

describe("utils.durationToUnixTimestamp", () => {
  it("should return the UNIX timestamp (as number) casted as a string but with the same numeric value", () => {
    const now = Date.now();

    assert.strictEqual(
      utils.durationToUnixTimestamp(now),
      now.toString()
    );
  });

  it("should return the UNIX timestamp (as string) without any type or value conversion", () => {
    const now = Date.now().toString();

    assert.strictEqual(
      utils.durationToUnixTimestamp(now),
      now
    );
  });

  it("should return a duration value as UNIX timestamp (stringified)", () => {
    const duration = "5m";
    const timestamp = utils.durationToUnixTimestamp(duration);

    assert.strictEqual(
      timestamp,
      dayjs()
        .subtract(Number(ms(duration)), "milliseconds")
        .unix()
        .toString()
    );
  });
});
