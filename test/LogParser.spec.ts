// Import Node.js Dependencies
import { describe, it, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { NoopLogParser, LogParser } from "../src/class/LogParser.class.js";

describe("NoopLogParser", () => {
  it("should return Array of logs without any modification (same ref)", () => {
    const input = ["A", "B"];

    const noop = new NoopLogParser();
    const result = noop.executeOnLogs(input);
    assert.strictEqual(input, result);
  });
});

describe("LogParser", () => {
  test("constructor must accept array of patterns", () => {
    const parser = new LogParser<{ A: number, B: number, name: string }>([
      "[scope: <A:num>|<B:num>]",
      "[name: <name:alphanum>"
    ]);

    const logs = parser.executeOnLogs([
      "[scope: 10|20][name: Thomas]"
    ]);
    assert.strictEqual(logs.length, 1);

    const [parsedLog] = logs;
    assert.deepEqual(parsedLog, { A: 10, B: 20, name: "Thomas" });
  });

  describe("define", () => {
    it("should assign the right field type and parse it successfully", () => {
      const parser = new LogParser<{ A: number, B: number }>("[scope: <A>|<B>]")
        .define("A", "num")
        .define("B", "num");

      const logs = parser.executeOnLogs([
        "[scope: 10|20]"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { A: 10, B: 20 });
    });

    it("should add an additional pattern to the selected type", () => {
      const parser = new LogParser<{ A: number, B: number | "*" }>("[scope: <A:num>|<B>]")
        .define("A", "num")
        .define("B", "num", "*");

      const logs = parser.executeOnLogs([
        "[scope: 10|*]"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { A: 10, B: "*" });
    });

    it("should trim pattern name and type", () => {
      const parser = new LogParser<{ A: number, B: number }>(
        "[scope: < A : num >|< B : num >]"
      );

      const logs = parser.executeOnLogs([
        "[scope: 10|20]"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { A: 10, B: 20 });
    });
  });

  describe("compile", () => {
    it("should return a function that we can execute on one log at a time", () => {
      const parser = new LogParser<{ A: number, B: number }>("[scope: <A:num>|<B:num>]");

      const parseLog = parser.compile();
      assert.deepEqual(
        parseLog("[scope: 10|20]"),
        [{ A: 10, B: 20 }]
      );
    });

    it("should return an empty Array if the log doesn't match the pattern", () => {
      const parser = new LogParser<{ A: number, B: number }>("[scope: <A:num>|<B:num>]");

      const parseLog = parser.compile();
      assert.deepEqual(
        parseLog("hello world"),
        []
      );
    });
  });

  describe("RegExp fields", () => {
    it("should be able to parse 'all', 'httpMethod' and `httpStatusCode` fields", () => {
      const parser = new LogParser<{
        method: string, endpoint: string, statusCode: number
      }>("<method:httpMethod> <endpoint> <statusCode:httpStatusCode>");

      const logs = parser.executeOnLogs([
        "GET https://github.com/OpenAlly 204"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(
        parsedLog,
        {
          method: "GET",
          endpoint: "https://github.com/OpenAlly",
          statusCode: 204
        }
      );
    });

    it("should be able to parse a 'num' field", () => {
      const parser = new LogParser<{ A: number, B: number }>("[scope: <A:num>|<B:num>]");

      const logs = parser.executeOnLogs([
        "[scope: 10|20]"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { A: 10, B: 20 });
    });

    it("should be able to parse a 'numStar' field", () => {
      const parser = new LogParser<{
        A: number | "*", B: number | "*"
      }>("[scope: <A:numStar>|<B:numStar>]");

      const logs = parser.executeOnLogs([
        "[scope: *|*]"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { A: "*", B: "*" });
    });

    it("should be able to parse an 'ip' field", () => {
      const parser = new LogParser<{ ip: string }>("<ip:ip>");

      const logs = parser.executeOnLogs([
        "127.0.0.1"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { ip: "127.0.0.1" });
    });

    it("should be able to parse a 'string' field", () => {
      const parser = new LogParser<{ ip: string }>("Introduction... <phrase:string>");

      const logs = parser.executeOnLogs([
        "Introduction... Bienvenue-à_toi"
      ]);
      assert.strictEqual(logs.length, 1);

      const [parsedLog] = logs;
      assert.deepEqual(parsedLog, { phrase: "Bienvenue-à_toi" });
    });
  });
});
