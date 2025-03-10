// Import Third-party Dependencies
import dayjs, { Dayjs } from "dayjs";
import ms from "ms";

// Import Internal Dependencies
import { LokiMatrix, LokiStream, RawQueryRangeResponse } from "./types.js";

export function durationToUnixTimestamp(duration: string | number): string {
  if (typeof duration === "number") {
    return String(duration);
  }
  if (!Object.is(Number(duration), NaN)) {
    return duration;
  }

  return dayjs()
    .subtract(ms(duration), "milliseconds")
    .unix()
    .toString();
}

export function escapeStringRegExp(str: string): string {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function transformStreamOrMatrixValue(
  value: [unixEpoch: number, log: string]
): { date: Dayjs; log: string; } {
  const [unixEpoch, log] = value;

  return {
    date: dayjs.unix(Number(unixEpoch) / 1000000),
    log
  };
}

export type TimeRange = [first: number, last: number];

export function inlineLogs(
  result: RawQueryRangeResponse<"streams">
): null | { values: string[]; timerange: TimeRange; } {
  if (result.status !== "success") {
    return null;
  }

  const flatLogs = result.data.result
    .flatMap(
      (host) => host.values.map(transformStreamOrMatrixValue)
    )
    .sort((left, right) => (left.date.isBefore(right.date) ? 1 : -1));
  if (flatLogs.length === 0) {
    return null;
  }

  return {
    values: flatLogs.map((row) => row.log),
    timerange: [flatLogs.at(0)!.date.unix(), flatLogs.at(-1)!.date.unix()]
  };
}

export function streamOrMatrixTimeRange(
  result: (LokiStream | LokiMatrix)[]
): [number, number] | null {
  if (result.length === 0) {
    return null;
  }

  const flatLogs = result
    .flatMap(
      (host) => [
        transformStreamOrMatrixValue(host.values.at(0)!),
        transformStreamOrMatrixValue(host.values.at(-1)!)
      ]
    )
    .sort((left, right) => (left.date.isBefore(right.date) ? 1 : -1));

  return [
    flatLogs.at(0)!.date.unix(),
    flatLogs.at(-1)!.date.unix()
  ];
}
