import { watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useLanguages } from "@core/composables/useLanguages";

const PLATFORM_LOCALE_STORAGE_KEY = "NG_TRANSLATE_LANG_KEY";

/**
 * One-way reactive bridge from the VirtoCommerce platform's locale key
 * (`NG_TRANSLATE_LANG_KEY`) to the shell's language service.
 *
 * Intended for embedded mode only. Call from `useShellBootstrap` when
 * `options.isEmbedded === true`.
 *
 * Behaviour:
 * - Applies the current platform value on setup (if non-empty).
 * - Watches the key and applies subsequent changes (including cross-tab
 *   `storage` events, handled by VueUse).
 * - Skips empty values so platform clearing the key does not blank the shell.
 * - Skips values equal to `currentLocale` to avoid redundant
 *   vee-validate reconfiguration.
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
