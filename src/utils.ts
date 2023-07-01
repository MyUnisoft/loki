// Import Third-party Dependencies
import dayjs from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import { QueryRangeResponse } from "./types.js";

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

export function inlineLogs(
  result: QueryRangeResponse
): string[] {
  if (result.status !== "success") {
    return [];
  }

  // TODO: handle matrix?
  const logs = result.data.result.flatMap(
    (host) => host.values.map(transformStreamValue)
  );

  return logs
    .sort((left, right) => (left.date.isBefore(right.date) ? 1 : -1))
    .map((row) => row.log);
}
