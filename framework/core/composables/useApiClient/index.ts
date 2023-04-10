import { useUser } from "../useUser";

interface IAuthApiBase {
  authToken: string;
  setAuthToken(token: string);
  getBaseUrl(defaultUrl: string, baseUrl: string);
}

interface UseApiClient<ApiClient extends IAuthApiBase> {
  getApiClient: () => Promise<ApiClient>;
}

export function useApiClient<ApiClient extends IAuthApiBase>(
  c: new (baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) => ApiClient
): UseApiClient<ApiClient> {
  const { getAccessToken } = useUser();

  async function getApiClient() {
    const client = new c();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  return {
    getApiClient,
  };
}
