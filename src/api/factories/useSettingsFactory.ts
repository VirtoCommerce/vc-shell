import { SettingClient } from "@vc-shell/api-client";
import { IUseSettingsFactoryParams } from "@vc-shell/core";

const useSettingsFactory = (): IUseSettingsFactoryParams => {
  const getApiClient = (token: string) => {
    const client = new SettingClient();
    client.setAuthToken(token);
    return client;
  };

  return {
    getApiClient,
  };
};

export default useSettingsFactory;
