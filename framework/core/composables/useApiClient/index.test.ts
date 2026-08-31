import { useApiClient, setApiClientFactory, IAuthApiBase, ApiClientHttp } from "./index";

class MockApiClient implements IAuthApiBase {
  authToken = "";
  baseUrl: string;
  http?: ApiClientHttp;

  constructor(baseUrl?: string, http?: ApiClientHttp) {
    this.baseUrl = baseUrl ?? "https://default.api";
    this.http = http;
  }

  /** Stands in for a generated operation: they all go through `this.http.fetch`. */
  callOperation() {
    return (this.http ?? window).fetch("/api/thing", { method: "GET" });
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

  // Constructing exactly as before matters: it is what keeps `this.http`
  // unset so the client resolves the interceptor at request time.
  it("passes no http seam when no signal was asked for", async () => {
    const { getApiClient } = useApiClient(MockApiClient);
    const client = await getApiClient();
    expect(client.http).toBeUndefined();
  });
});

describe("useApiClient — cancellation", () => {
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
    setApiClientFactory(undefined);
  });

  it("forwards the signal to every request the client makes", async () => {
    const spy = vi.fn().mockResolvedValue(new Response());
    window.fetch = spy as unknown as typeof window.fetch;
    const controller = new AbortController();

    const { getApiClient } = useApiClient(MockApiClient, { signal: controller.signal });
    const client = await getApiClient();
    await client.callOperation();

    expect(spy).toHaveBeenCalledWith("/api/thing", expect.objectContaining({ signal: controller.signal }));
  });

  it("keeps the request options the client built", async () => {
    const spy = vi.fn().mockResolvedValue(new Response());
    window.fetch = spy as unknown as typeof window.fetch;

    const { getApiClient } = useApiClient(MockApiClient, { signal: new AbortController().signal });
    await (await getApiClient()).callOperation();

    expect(spy.mock.calls[0][1]).toMatchObject({ method: "GET" });
  });

  it("aborting reaches the fetch boundary", async () => {
    const spy = vi.fn().mockResolvedValue(new Response());
    window.fetch = spy as unknown as typeof window.fetch;
    const controller = new AbortController();

    const { getApiClient } = useApiClient(MockApiClient, { signal: controller.signal });
    await (await getApiClient()).callOperation();
    controller.abort();

    expect(spy.mock.calls[0][1].signal.aborted).toBe(true);
  });

  // Capturing `window.fetch` at construction would bypass the interceptor, which
  // the framework installs by replacing `window.fetch` during setup.
  it("honours a window.fetch swapped after the client was built", async () => {
    window.fetch = vi.fn().mockResolvedValue(new Response()) as unknown as typeof window.fetch;

    const { getApiClient } = useApiClient(MockApiClient, { signal: new AbortController().signal });
    const client = await getApiClient();

    const later = vi.fn().mockResolvedValue(new Response());
    window.fetch = later as unknown as typeof window.fetch;
    await client.callOperation();

    expect(later).toHaveBeenCalledOnce();
  });
});

describe("useApiClient — provided factory", () => {
  afterEach(() => {
    setApiClientFactory(undefined);
  });

  it("hands out what the factory built", async () => {
    const provided = new MockApiClient("https://provided.api");
    setApiClientFactory(() => provided as never);

    const client = await useApiClient(MockApiClient).getApiClient();

    expect(client).toBe(provided);
  });

  it("gives the factory the constructor and the options", async () => {
    const factory = vi.fn(() => new MockApiClient() as never);
    setApiClientFactory(factory);
    const signal = new AbortController().signal;

    await useApiClient(MockApiClient, { signal }).getApiClient();

    expect(factory).toHaveBeenCalledWith(MockApiClient, { signal });
  });

  it("clearing the factory restores the default construction", async () => {
    setApiClientFactory(() => new MockApiClient("https://provided.api") as never);
    setApiClientFactory(undefined);

    const client = await useApiClient(MockApiClient).getApiClient();

    expect(client.baseUrl).toBe("https://default.api");
  });
});
