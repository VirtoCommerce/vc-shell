import * as veeValidate from "vee-validate";
import { i18n } from "../../plugins/i18n";
import { setLocale as setVeeI18nLocale, localize } from "@vee-validate/i18n";
import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { ComputedRef, computed } from "vue";
import ISO6391 from "iso-639-1";

export interface IUseLanguages {
  setLocale: (locale: string) => void;
  currentLocale: ComputedRef<string>;
  getLocaleByTag: (localeTag: string) => string | undefined;
}

export const useLanguages = createSharedComposable(() => {
  const defaultLanguage = i18n.global.locale.value;
  const savedLocale = useLocalStorage("VC_LANGUAGE_SETTINGS", "");

  const currentLocale = computed(() => {
    let locale = defaultLanguage;

    if (i18n.global.availableLocales.includes(savedLocale.value)) {
      locale = savedLocale.value;
    }

    return locale;
  });

  function setLocale(locale: string) {
    i18n.global.locale.value = locale;
    veeValidate.configure({
      generateMessage: localize(locale, {
        messages: (i18n.global.getLocaleMessage(locale) as { messages: Record<string, string> }).messages,
      }),
    });
    setVeeI18nLocale(locale);
    savedLocale.value = locale;
  }

  function getLocaleByTag(localeTag: string) {
    if (!localeTag) return;

    const twoLetterLanguageName = localeTag.split("-")[0];

    return ISO6391.getNativeName(twoLetterLanguageName);
  }

  return {
    setLocale,
    currentLocale,
    getLocaleByTag,
  };
});
