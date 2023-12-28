/* eslint-disable */
export class AuthApiBase {
  authToken = "";
  protected constructor() {}

  // Enforce always return empty string as baseUrl
  getBaseUrl(defaultUrl: string, baseUrl: string) {
    return "";
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  protected transformOptions(options: any): Promise<any> {
    if (this.authToken) {
      options.headers["authorization"] = `Bearer ${this.authToken}`;
    }
    return Promise.resolve(options);
  }
}
