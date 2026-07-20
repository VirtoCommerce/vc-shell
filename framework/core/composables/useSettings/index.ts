import { useAsync } from "@core/composables/useAsync";
import { useApiClient } from "@core/composables/useApiClient";
import { computed, Ref, ref, ComputedRef, onMounted } from "vue";
import { SettingClient } from "@core/api/platform";
import { useLoading } from "@core/composables/useLoading";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-settings");

interface IUISetting {
  contrast_logo?: string;
  logo?: string;
  title?: string;
  avatar?: string;
  role?: string;
}

export interface UseSettingsReturn {
  readonly uiSettings: Ref<IUISetting>;
  readonly loading: ComputedRef<boolean>;
  applySettings: (args: { logo?: string; title?: string; avatar?: string; role?: string }) => void;
}

/** @deprecated Use UseSettingsReturn instead */
export type IUseSettings = UseSettingsReturn;

export function useSettings(): UseSettingsReturn {
  const uiSettings = ref<IUISetting | undefined>();
  const customSettingsApplied = ref(false);

  const { getApiClient } = useApiClient(SettingClient);

  const { loading, action: getUiCustomizationSettings } = useAsync(async () => {
    if (customSettingsApplied.value) return;

    const result = await (await getApiClient()).getUICustomizationSetting();

    // defaultValue can be empty or malformed JSON — JSON.parse would throw and
    // reject the whole action, so guard it and treat unparseable settings as absent.
    let settings: IUISetting | null = null;
    if (result.defaultValue) {
      try {
        settings = JSON.parse(result.defaultValue);
      } catch (e) {
        logger.warn("Failed to parse UI customization settings JSON; ignoring.", e);
      }
    }

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
