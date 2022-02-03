import { useLogger, useUser } from "@virtoshell/core";
import { MarketingModuleDynamicContentClient } from "@virtoshell/api-client";

export default () => {
  const logger = useLogger();
  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  return {};
};
