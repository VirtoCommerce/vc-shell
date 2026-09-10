import { watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useLanguages } from "@core/composables/useLanguages";

const PLATFORM_LOCALE_STORAGE_KEY = "NG_TRANSLATE_LANG_KEY";

/**
 * One-way reactive bridge from the platform locale key (`NG_TRANSLATE_LANG_KEY`) to the
 * shell's language service. Embedded mode only: call from `useShellBootstrap` when
 * `options.isEmbedded === true`. Applies the current value on setup and every later change
 * (cross-tab `storage` events included), skipping empty values so a cleared key does not
 * blank the shell, and values equal to `currentLocale` to avoid vee-validate churn.
 */
export function usePlatformLocaleSync(): void {
  const { setLocale, currentLocale } = useLanguages();
  const platformLocale = useLocalStorage(PLATFORM_LOCALE_STORAGE_KEY, "");

  const apply = (value: string) => {
    if (!value) return;
    if (value === currentLocale.value) return;
    setLocale(value);
  };

  apply(platformLocale.value);
  watch(platformLocale, apply);
}
