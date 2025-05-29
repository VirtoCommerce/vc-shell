import * as veeValidate from "vee-validate";
import { i18n } from "../../plugins/i18n";
import { setLocale as setVeeI18nLocale, localize } from "@vee-validate/i18n";
import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { ComputedRef, computed } from "vue";
import ISO6391 from "iso-639-1";
import { languageToCountryMap } from "../../constants";

export interface IUseLanguages {
  setLocale: (locale: string) => void;
  currentLocale: ComputedRef<string>;
  getLocaleByTag: (localeTag: string) => string | undefined;
  resolveCamelCaseLocale: (locale: string) => string;
  getFlag: (language: string) => Promise<string>;
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

  function resolveCamelCaseLocale(locale: string) {
    const formattedLocale = locale.replace(/([a-z]+)([A-Z]+)/g, "$1-$2").toLowerCase();

    if (i18n.global.getLocaleMessage(formattedLocale)) {
      return formattedLocale;
    }
    return "en";
  }

  function getCountryCode(language: string): string {
    return (
      languageToCountryMap[language.toLocaleLowerCase()] || languageToCountryMap[language.slice(0, 2)] || "xx" // placeholder for unknown country
    );
  }

  async function getFlag(language: string): Promise<string> {
    const countryCode = getCountryCode(language);
    return new URL(`../../../assets/icons/flags/${countryCode}.svg`, import.meta.url).href;
  }

  return {
    setLocale,
    currentLocale,
    getLocaleByTag,
    resolveCamelCaseLocale,
    getFlag,
    getCountryCode,
  };
});
