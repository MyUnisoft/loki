// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import dayjs from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import * as utils from "../src/utils.js";
import { mockStreamResponse } from "./utils/logs.factory.js";

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

describe("utils.streamOrMatrixTimeRange", () => {
  it("should return null if there no logs", () => {
    const logs = mockStreamResponse(
      []
    );

    const range = utils.streamOrMatrixTimeRange(logs.data.result);
    assert.strictEqual(range, null);
  });

  it("should return the lowest timestamp at start and the highest as end", () => {
    const expectedRange = [50, 1710785069];
    const timestamps = expectedRange.map(toNanoSecondsEpoch);
    const logs = mockStreamResponse(
      ["foo", "bar"],
      () => timestamps.pop()!
    );

    const range = utils.streamOrMatrixTimeRange(logs.data.result)!;
    assert.deepEqual(
      range,
      expectedRange.reverse()
    );
  });

  it("should return the right start/end with multiple streams", () => {
    const tsRangeA = [50, 89403, 1710785069].map(toNanoSecondsEpoch);
    const streamLogsA = mockStreamResponse(
      ["foo", "bar", "xd"],
      () => tsRangeA.pop()!
    );

    const tsRangeB = [40, 458, 1710784069].map(toNanoSecondsEpoch);
    const streamLogsB = mockStreamResponse(
      ["foo", "bar", "xd"],
      () => tsRangeB.pop()!
    );

    const range = utils.streamOrMatrixTimeRange([
      ...streamLogsA.data.result,
      ...streamLogsB.data.result
    ])!;
    assert.deepEqual(
      range,
      [1710785069, 40]
    );
  });
});

function toNanoSecondsEpoch(value: number) {
  return value * 1000000;
}
