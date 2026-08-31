export interface IAuthApiBase {
  authToken: string;
  setAuthToken(token: string): void;
  getBaseUrl(defaultUrl: string, baseUrl: string): string;
}

/** The HTTP seam the generated clients accept as their second constructor argument. */
export interface ApiClientHttp {
  fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
}

export type ApiClientCtor<ApiClient extends IAuthApiBase> = new (baseUrl?: string, http?: ApiClientHttp) => ApiClient;

export interface UseApiClientOptions {
  /**
   * Cancels every request the returned client makes.
   *
   * The generated clients take no `AbortSignal` of their own — they build their
   * own `RequestInit` — so the signal travels through the `http` seam instead,
   * which every operation of every client already routes through.
   */
  signal?: AbortSignal;
}

export interface UseApiClientReturn<ApiClient extends IAuthApiBase> {
  getApiClient: () => Promise<ApiClient>;
}

/** @deprecated Use UseApiClientReturn instead */
export type UseApiClient<ApiClient extends IAuthApiBase> = UseApiClientReturn<ApiClient>;

/** Builds the client instance. Replaceable so an app or a test can supply its own. */
export type ApiClientFactory = <ApiClient extends IAuthApiBase>(
  ctor: ApiClientCtor<ApiClient>,
  options: UseApiClientOptions,
) => ApiClient;

/**
 * Module-level rather than provide/inject on purpose: `useApiClient` is called at
 * module top level in several places, outside any component, where `inject()`
 * returns undefined.
 */
let apiClientFactory: ApiClientFactory | undefined;

export function setApiClientFactory(factory: ApiClientFactory | undefined): void {
  apiClientFactory = factory;
}

function defaultApiClientFactory<ApiClient extends IAuthApiBase>(
  ctor: ApiClientCtor<ApiClient>,
  { signal }: UseApiClientOptions,
): ApiClient {
  // Without a signal, construct exactly as before: `http` stays unset, so the
  // client falls back to `window` and resolves the interceptor at request time.
  if (!signal) return new ctor();

  return new ctor(undefined, {
    // `window.fetch` is read per call, never captured: installing the framework
    // replaces it with the interceptor, and tests swap it too. A captured
    // reference would silently bypass both.
    //
    // A signal the client set itself would be overwritten here. None of the
    // generated clients set one (`useAbortSignal` is off in the codegen config),
    // and the caller asking for cancellation is the more specific intent.
    fetch: (url, init) => window.fetch(url, { ...init, signal }),
  });
}

export function useApiClient<ApiClient extends IAuthApiBase>(
  c: ApiClientCtor<ApiClient>,
  options: UseApiClientOptions = {},
): UseApiClientReturn<ApiClient> {
  async function getApiClient() {
    return (apiClientFactory ?? defaultApiClientFactory)(c, options);
  }

  return {
    getApiClient,
  };
}
