
export type ApiCredentialAuthorizationOptions = {
  type: "bearer";
  token: string;
} | {
  type: "classic";
  username: string;
  password: string;
} | {
  type: "custom";
  authorization: string;
};

export class ApiCredential {
  private authorization: string | null;
  private userAgent: string | null;

  static buildAuthorizationHeader(
    authorizationOptions: ApiCredentialAuthorizationOptions
  ): string {
    switch (authorizationOptions.type) {
      case "bearer":
        return `Bearer ${authorizationOptions.token}`;
      case "classic": {
        const { username, password } = authorizationOptions;

        return Buffer
          .from(`${username}:${password}`)
          .toString("base64");
      }
      case "custom":
      default:
        return authorizationOptions.authorization;
    }
  }

  constructor(
    authorizationOptions?: ApiCredentialAuthorizationOptions,
    userAgent?: string
  ) {
    this.authorization = authorizationOptions ?
      ApiCredential.buildAuthorizationHeader(authorizationOptions) :
      null;
    this.userAgent = userAgent ?? null;
  }

  get httpOptions() {
    return {
      headers: {
        ...(this.authorization === null ? {} : { authorization: this.authorization }),
        ...(this.userAgent === null ? {} : { "User-Agent": this.userAgent })
      }
    };
  }
}
