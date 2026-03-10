export interface IAuthApiBase {
  authToken: string;
  setAuthToken(token: string): void;
  getBaseUrl(defaultUrl: string, baseUrl: string): string;
}

export interface UseApiClientReturn<ApiClient extends IAuthApiBase> {
  getApiClient: () => Promise<ApiClient>;
}

/** @deprecated Use UseApiClientReturn instead */
export type UseApiClient<ApiClient extends IAuthApiBase> = UseApiClientReturn<ApiClient>;

export function useApiClient<ApiClient extends IAuthApiBase>(
  c: new (baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) => ApiClient,
): UseApiClientReturn<ApiClient> {
  async function getApiClient() {
    const client = new c();
    return client;
  }

  return {
    getApiClient,
  };
}
