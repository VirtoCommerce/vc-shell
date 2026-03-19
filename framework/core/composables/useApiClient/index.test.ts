import { useApiClient, IAuthApiBase } from "./index";

class MockApiClient implements IAuthApiBase {
  authToken = "";
  baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? "https://default.api";
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getBaseUrl(defaultUrl: string, baseUrl: string) {
    return baseUrl || defaultUrl;
  }
}

describe("useApiClient", () => {
  it("returns an object with getApiClient function", () => {
    const { getApiClient } = useApiClient(MockApiClient);
    expect(getApiClient).toBeTypeOf("function");
  });

  it("getApiClient creates and returns an instance of the provided class", async () => {
    const { getApiClient } = useApiClient(MockApiClient);
    const client = await getApiClient();
    expect(client).toBeInstanceOf(MockApiClient);
  });

  it("getApiClient returns a fresh instance on each call", async () => {
    const { getApiClient } = useApiClient(MockApiClient);
    const client1 = await getApiClient();
    const client2 = await getApiClient();
    expect(client1).not.toBe(client2);
  });

  it("created client has default properties", async () => {
    const { getApiClient } = useApiClient(MockApiClient);
    const client = await getApiClient();
    expect(client.authToken).toBe("");
    expect(client.baseUrl).toBe("https://default.api");
  });

  it("client methods are functional after creation", async () => {
    const { getApiClient } = useApiClient(MockApiClient);
    const client = await getApiClient();
    client.setAuthToken("test-token");
    expect(client.authToken).toBe("test-token");
    expect(client.getBaseUrl("default", "override")).toBe("override");
    expect(client.getBaseUrl("default", "")).toBe("default");
  });
});
