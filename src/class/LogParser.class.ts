/* eslint-disable func-style */

// Import Internal Dependencies
import { escapeStringRegExp } from "../utils.js";

// CONSTANTS
const kNoopField = (str: string) => str;
const kOneOrManyField = (str: string) => `[${str}]+`;

type RegExField = {
  pattern: string;
  id: (str: string) => string;
}

const kAvailableRegExField: Record<string, RegExField> = {
  all: {
    pattern: ".*", id: kNoopField
  },
  num: {
    pattern: "0-9", id: kOneOrManyField
  },
  numStar: {
    pattern: "0-9*", id: kOneOrManyField
  },
  ip: {
    pattern: "0-9.", id: kOneOrManyField
  },
  word: {
    pattern: "\\w", id: kOneOrManyField
  },
  httpMethod: {
    pattern: "GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS", id: kNoopField
  },
  httpStatusCode: {
    pattern: "0-9", id: (str) => `[${str}]{3}`
  },
  alphanum: {
    pattern: "a-zA-Z0-9", id: kOneOrManyField
  },
  string: {
    pattern: "_\\u00C0-\\u017F*\\w\\s-", id: kOneOrManyField
  }
};

export interface LogParserLike<T> {
  executeOnLogs(logs: string[]): T[];
}

export class NoopLogParser<T = string> implements LogParserLike<T> {
  executeOnLogs(logs: string[]): T[] {
    return logs as T[];
  }
}

export class LogParser<T = any> implements LogParserLike<T> {
  static RegExp() {
    return /<([a-zA-Z0-9: ]+)>/g;
  }

  private fields = new Map<string, string>();
  private pattern: string;

  constructor(pattern: string | string[]) {
    this.pattern = escapeStringRegExp(
      Array.isArray(pattern) ? pattern.join("") : pattern
    );
  }

  define(
    fieldName: keyof T & string,
    fieldKind: keyof typeof kAvailableRegExField,
    additionalPattern = ""
  ) {
    const regexField = kAvailableRegExField[fieldKind];
    this.fields.set(fieldName, regexField.id(regexField.pattern + additionalPattern));

    return this;
  }

  compile(): (log: string) => [] | [log: T] {
    const exprStr = this.pattern.replaceAll(
      LogParser.RegExp(),
      this.replacer.bind(this)
    );

    return (log) => {
      const match = new RegExp(exprStr).exec(log);

      return match === null ? [] : [match.groups as T];
    };
  }

  executeOnLogs(logs: string[]): T[] {
    return logs.flatMap(this.compile());
  }

  private replacer(_: string, matchingFieldOne: string) {
    const [fieldName, fieldType = null] = matchingFieldOne.split(":");
    const trimmedFieldName = fieldName.trim();

    if (fieldType !== null && fieldType in kAvailableRegExField) {
      this.define(trimmedFieldName as any, fieldType.trim());
    }

    const pattern = this.fields.has(trimmedFieldName) ?
      this.fields.get(trimmedFieldName)! :
      kAvailableRegExField.all.pattern;

    return `(?<${trimmedFieldName}>${pattern})`;
  }
}
