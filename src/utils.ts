// Import Third-party Dependencies
import dayjs from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import { RawQueryRangeResponse } from "./types.js";

export function durationToUnixTimestamp(duration: string | number): string {
  if (typeof duration === "number") {
    return String(duration);
  }

  return dayjs()
    .subtract(ms(duration), "milliseconds")
    .unix()
    .toString();
}

export function escapeStringRegExp(str: string): string {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function transformStreamValue(
  value: [unixEpoch: string, log: string]
) {
  const [unixEpoch, log] = value;

  return {
    date: dayjs.unix(Number(unixEpoch) / 1000000),
    log
  };
}

export type TimeRange = [first: number, last: number];

export function inlineLogs(
  result: RawQueryRangeResponse
): null | { logs: string[], timerange: TimeRange } {
  if (result.status !== "success") {
    return null;
  }

  // TODO: handle matrix?
  const flatLogs = result.data.result
    .flatMap(
      (host) => host.values.map(transformStreamValue)
    )
    .sort((left, right) => (left.date.isBefore(right.date) ? 1 : -1));
  if (flatLogs.length === 0) {
    return null;
  }

  return {
    logs: flatLogs.map((row) => row.log),
    timerange: [flatLogs.at(0)!.date.unix(), flatLogs.at(-1)!.date.unix()]
  };
}
