/* eslint-disable */

export class AuthApiBase {
  authToken = "";

  /**
   * JSON parse reviver for converting date strings to Date objects.
   * Subclasses use this when parsing API responses.
   * The dateReviver function is defined in File.Header.liquid template.
   */
  protected jsonParseReviver = dateReviver;

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
