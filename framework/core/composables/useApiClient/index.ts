import { AuthApiBase } from "@/core/api";
import useUser from "../useUser";

interface UseApiClient<ApiClient extends AuthApiBase> {
  getApiClient: () => Promise<ApiClient>;
}

export function useApiClient<ApiClient extends AuthApiBase>(
  c: new () => ApiClient
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
