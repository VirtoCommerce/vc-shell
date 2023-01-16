import { useUser, useLogger } from "@/core/composables";
import { computed, Ref, ref } from "vue";
import { ObjectSettingEntry, SettingClient } from "@/core/api";

interface IUISetting {
  contrast_logo?: string;
  logo?: string;
  title?: string;
}

interface IUseSettings {
  readonly uiSettings: Ref<IUISetting>;
  getUiCustomizationSettings: () => void;
  applySettings: (args: { logo?: string; title?: string }) => void;
}

const uiSettings = ref<IUISetting>({
  logo: undefined,
  title: undefined,
});
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

  function applySettings(args: { logo?: string; title?: string }) {
    if (args.logo) {
      uiSettings.value.logo = args.logo;
    }
    if (args.title) {
      uiSettings.value.title = args.title;
    }
  }

  return {
    uiSettings: computed(() => uiSettings.value),
    getUiCustomizationSettings,
    applySettings,
  };
};
