import useUser from "../useUser";
import useLogger from "../useLogger";
import { computed, inject, Ref, ref } from "vue";
import { IUseSettingsFactoryParams } from "../../types/factories";

interface IUseSettings {
  readonly uiSettings: Ref<Record<string, string>>;
  getUiCustomizationSettings: () => void;
}

const uiSettings = ref<Record<string, string>>();
export default (): IUseSettings => {
  const useSettingsFactory = inject<IUseSettingsFactoryParams>("useSettingsFactory");
  const { getAccessToken } = useUser();
  const logger = useLogger();

  async function getApiClient() {
    return useSettingsFactory.getApiClient(await getAccessToken());
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
