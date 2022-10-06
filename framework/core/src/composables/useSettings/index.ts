import useUser from "../useUser";
import useLogger from "../useLogger";
import { computed, Ref, ref } from "vue";
import { SettingClient } from "@vc-shell/api-client";

interface IUseSettings {
  readonly uiSettings: Ref<Record<string, string>>;
  getUiCustomizationSettings: () => void;
}

const uiSettings = ref<Record<string, string>>();
export default (): IUseSettings => {
  const { getAccessToken } = useUser();
  const logger = useLogger();

  async function getApiClient() {
    const client = new SettingClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getUiCustomizationSettings() {
    const client = await getApiClient();

    try {
      const result = await client.getUICustomizationSetting();
      uiSettings.value = JSON.parse(result.defaultValue);
    } catch (e) {
      logger.error(e);
    }
  }

  return {
    uiSettings: computed(() => uiSettings.value),
    getUiCustomizationSettings,
  };
};
