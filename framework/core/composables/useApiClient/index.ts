export interface IAuthApiBase {
  authToken: string;
  setAuthToken(token: string): void;
  getBaseUrl(defaultUrl: string, baseUrl: string): string;
}

interface UseApiClient<ApiClient extends IAuthApiBase> {
  getApiClient: () => Promise<ApiClient>;
}

export function useApiClient<ApiClient extends IAuthApiBase>(
  c: new (baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) => ApiClient,
): UseApiClient<ApiClient> {
  async function getApiClient() {
    const client = new c();
    return client;
  }

  return {
    getApiClient,
  };
}
