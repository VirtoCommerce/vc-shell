import { useAsync } from "./../useAsync";
import { useApiClient } from "./../useApiClient";
import { computed, Ref, ref, ComputedRef, onMounted } from "vue";
import { SettingClient } from "./../../api/platform";
import { useLoading } from "../useLoading";

interface IUISetting {
  contrast_logo?: string;
  logo?: string;
  title?: string;
  avatar?: string;
  role?: string;
}

interface IUseSettings {
  readonly uiSettings: Ref<IUISetting>;
  readonly loading: ComputedRef<boolean>;
  applySettings: (args: { logo?: string; title?: string; avatar?: string; role?: string }) => void;
}

export function useSettings(): IUseSettings {
  const uiSettings = ref<IUISetting | undefined>();
  const customSettingsApplied = ref(false);

  const { getApiClient } = useApiClient(SettingClient);

  const { loading, action: getUiCustomizationSettings } = useAsync(async () => {
    if (customSettingsApplied.value) return;

    const result = await (await getApiClient()).getUICustomizationSetting();
    const settings = await JSON.parse(result.defaultValue ?? null);

    if (settings && !uiSettings.value) {
      uiSettings.value = {
        contrast_logo: settings.contrast_logo,
        logo: settings.logo,
        title: settings.title,
      };
    }
  });

  function applySettings(args: { logo?: string; title?: string; avatar?: string; role?: string }) {
    customSettingsApplied.value = true;
    uiSettings.value = {
      ...uiSettings.value,
      logo: args.logo,
      title: args.title,
      avatar: args.avatar,
      role: args.role,
    };
  }

  onMounted(async () => {
    if (!uiSettings.value && !customSettingsApplied.value) {
      await getUiCustomizationSettings();
    }
  });

  return {
    uiSettings: computed(() => uiSettings.value ?? {}),
    applySettings,
    loading: useLoading(loading),
  };
}
