
export class ApiCredential {
  private token: string;

  constructor(
    token?: string
  ) {
    this.token = token ?? process.env.GRAFANA_API_TOKEN!;
    if (typeof this.token === "undefined") {
      throw new Error("API token must be provided to use the Grafana API");
    }
  }

  get httpOptions() {
    return {
      headers: {
        authorization: `Bearer ${this.token}`
      }
    };
  }
}
