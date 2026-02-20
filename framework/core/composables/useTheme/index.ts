import { BasicColorSchema, useColorMode, useCycleList } from "@vueuse/core";
import { computed, watchEffect, ref, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { i18n } from "@core/plugins/i18n";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-theme");

export interface ThemeDefinition {
  key: string;
  localizationKey?: string;
}

export interface DisplayTheme {
  key: string;
  name: string; // localized name
}

export interface IUseTheme {
  themes: Ref<DisplayTheme[]>;
  currentThemeKey: Ref<string>;
  currentLocalizedName: Ref<string>;
  next: () => void;
  register: (themesToAdd: ThemeDefinition | ThemeDefinition[]) => void;
  unregister: (themeKeysToRemove: string | string[]) => void;
  setTheme: (themeKey: string) => void;
}

// Initialize with a default "light" theme, assuming a convention for its localization key.
const _themeRegistry: Ref<ThemeDefinition[]> = ref([{ key: "light", localizationKey: "CORE.THEMES.LIGHT" }]);

export const useTheme = (): IUseTheme => {
  const { t } = i18n.global;

  function register(themesToAdd: ThemeDefinition | ThemeDefinition[]) {
    (Array.isArray(themesToAdd) ? themesToAdd : [themesToAdd]).forEach((themeDef) => {
      if (!_themeRegistry.value.some((t) => t.key === themeDef.key)) {
        _themeRegistry.value.push(themeDef);
      }
    });
  }

  function unregister(themeKeysToRemove: string | string[]) {
    (Array.isArray(themeKeysToRemove) ? themeKeysToRemove : [themeKeysToRemove]).forEach((keyToRemove) => {
      const index = _themeRegistry.value.findIndex((t) => t.key === keyToRemove);
      if (index >= 0) {
        // Ensure we don't unregister the last theme if it's active, or handle active theme change.
        // For simplicity now, just remove. Consider active theme implications if this is an issue.
        // Especially if 'light' is removed and it's the initial/fallback.
        // However, 'light' is added by default and this function is for custom themes.
        _themeRegistry.value.splice(index, 1);
      }
    });
  }

  const themeKeys = computed(() => _themeRegistry.value.map((t) => t.key));

  const mode = useColorMode({
    attribute: "data-theme",
    emitAuto: true,
    initialValue: "light", // Should align with a default theme in _themeRegistry
    modes: {
      // Dynamically build modes from registered theme keys
      ...themeKeys.value.reduce(
        (acc, name) => {
          acc[name] = name; // Maps theme key to itself (e.g., "ocean": "ocean")
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const { state, next } = useCycleList(themeKeys, { initialValue: mode });

  watchEffect(() => {
    if (state.value) {
      // Ensure state.value is not undefined
      mode.value = state.value as BasicColorSchema; // state.value is a theme key
    }
  });

  function setTheme(themeKey: string) {
    if (themeKeys.value.includes(themeKey)) {
      state.value = themeKey;
    } else {
      logger.warn(`Attempted to set an unregistered theme: ${themeKey}`);
    }
  }

  const currentLocalizedName = computed(() => {
    const currentDef = _themeRegistry.value.find((t) => t.key === state.value);
    if (currentDef) {
      return currentDef.localizationKey ? t(currentDef.localizationKey) : _.capitalize(currentDef.key);
    }
    // Fallback if current theme key somehow not in registry (should not happen with proper setTheme guard)
    return state.value ? _.capitalize(state.value) : "";
  });

  return {
    themes: computed(() =>
      _themeRegistry.value.map((themeDef) => ({
        key: themeDef.key,
        name: themeDef.localizationKey ? t(themeDef.localizationKey) : _.capitalize(themeDef.key),
      })),
    ),
    currentThemeKey: state,
    currentLocalizedName,
    next,
    register,
    unregister,
    setTheme,
  };
};
