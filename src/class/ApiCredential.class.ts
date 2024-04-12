
export class ApiCredential {
  private token: string;
  private userAgent: string | null;

  constructor(
    token?: string,
    userAgent?: string
  ) {
    this.token = token ?? process.env.GRAFANA_API_TOKEN!;
    this.userAgent = userAgent ?? null;

    if (typeof this.token === "undefined") {
      throw new Error("API token must be provided to use the Grafana API");
    }
  }

  get httpOptions() {
    return {
      headers: {
        authorization: `Bearer ${this.token}`,
        ...(this.userAgent === null ? {} : { "User-Agent": this.userAgent })
      }
    };
  }
}
