import { useUser } from "./../useUser";
import { computed, Ref, ref } from "vue";
import { SettingClient } from "./../../api";

interface IUISetting {
  contrast_logo?: string;
  logo?: string;
  title?: string;
}

interface IUseSettings {
  readonly uiSettings: Ref<IUISetting>;
  getUiCustomizationSettings: (base: string) => void;
  applySettings: (args: { logo?: string; title?: string }) => void;
}

const uiSettings = ref<IUISetting>({
  logo: undefined,
  title: undefined,
});
export function useSettings(): IUseSettings {
  const { getAccessToken } = useUser();

  async function getApiClient() {
    const client = new SettingClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getUiCustomizationSettings(base: string) {
    const client = await getApiClient();

    try {
      const result = await client.getUICustomizationSetting();
      const settings = JSON.parse(result.defaultValue);
      uiSettings.value = {
        contrast_logo: base + settings.contrast_logo,
        logo: base + settings.logo,
        title: settings.title,
      };
    } catch (e) {
      console.error(e);
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
}
