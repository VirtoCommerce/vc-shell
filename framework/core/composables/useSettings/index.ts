import { useAsync } from "./../useAsync";
import { useApiClient } from "./../useApiClient";
import { computed, Ref, ref, ComputedRef, onMounted, inject } from "vue";
import { SettingClient } from "./../../api/platform";
import { useLoading } from "../useLoading";
import { shouldEnablePlatformFeatures } from "../../providers/auth-provider-utils";
import { AuthProviderKey } from "../../../injection-keys";

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
  // Check if we're using a custom auth provider
  const authProvider = inject(AuthProviderKey);
  const isPlatformProvider = shouldEnablePlatformFeatures(authProvider);
  const uiSettings = ref<IUISetting | undefined>();
  const customSettingsApplied = ref(false);

  const { getApiClient } = useApiClient(SettingClient);

  const { loading, action: getUiCustomizationSettings } = useAsync(async () => {
    if (customSettingsApplied.value || !isPlatformProvider) return;

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
    if (!uiSettings.value && !customSettingsApplied.value && isPlatformProvider) {
      await getUiCustomizationSettings();
    }
  });

  return {
    uiSettings: computed(() => uiSettings.value ?? {}),
    applySettings,
    loading: useLoading(loading),
  };
}
