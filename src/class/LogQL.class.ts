export type LineFilterOperators = "|=" | "!=" | "|~" | "!~";

/**
 * @see https://grafana.com/docs/loki/latest/logql/log_queries/
 */
export class LogQL<T extends string = string> {
  static EQ = "|=";
  static NotEQ = "!=";
  static RegEQ = "|~";
  static RegNotEQ = "!~";

  private labels: Record<T, string>;
  private filters: string[] = [];

  constructor(labels: Record<T, string>) {
    this.labels = labels;
  }

  filter(operator: LineFilterOperators, value: string) {
    this.filters.push(
      `${operator} ${isRegExpOperator(operator) ? `\`${value}\`` : `"${value}"`}`
    );

    return this;
  }

  private labelsToString() {
    const labels = Object.entries(this.labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(",");

    return `{${labels}}`;
  }

  toString() {
    return `${this.labelsToString()} ${this.filters.join(" ")}`.trimEnd();
  }
}

function isRegExpOperator(operator: LineFilterOperators) {
  return operator === LogQL.RegEQ || operator === LogQL.RegNotEQ;
}
