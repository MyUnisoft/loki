// Import Internal Dependencies
import {
  RawQueryRangeResponse,
  LokiMatrix
} from "../../src/index.js";

export function mockStreamResponse(
  logs: string[],
  unixGenerator = getNanoSecTime
): RawQueryRangeResponse {
  return {
    status: "success",
    data: {
      resultType: "streams",
      result: logs.length > 0 ? [
        {
          stream: { foo: "bar" },
          values: logs.map((log) => [unixGenerator(), log])
        }
      ] : [],
      stats: {} as any
    }
  };
}

export function mockMatrixResponse(
  logs: string[],
  unixGenerator = getNanoSecTime
): RawQueryRangeResponse<LokiMatrix> {
  return {
    status: "success",
    data: {
      resultType: "matrix",
      result: logs.length > 0 ? [
        {
          metric: { foo: "bar" },
          values: logs.map((log) => [unixGenerator(), log])
        }
      ] : [],
      stats: {} as any
    }
  };
}

export function getNanoSecTime() {
  const hrTime = process.hrtime();

  return (hrTime[0] * 1000000000) + hrTime[1];
}
