import * as veeValidate from "vee-validate";
import { i18n } from "../plugins/i18n";
import { setLocale as setVeeI18nLocale, localize } from "@vee-validate/i18n";
import { useLocalStorage } from "@vueuse/core";
import { ComputedRef, computed } from "vue";
import ISO6391 from "iso-639-1";
import { languageToCountryMap } from "../constants";

export interface ILanguageService {
  setLocale: (locale: string) => void;
  currentLocale: ComputedRef<string>;
  getLocaleByTag: (localeTag: string) => string | undefined;
  resolveCamelCaseLocale: (locale: string) => string;
  getFlag: (language: string) => Promise<string>;
  getCountryCode: (language: string) => string;
}

/**
 * Language service implementation
 * Handles locale management, validation, and language utilities
 */
export function createLanguageService(): ILanguageService {
  const savedLocale = useLocalStorage("VC_LANGUAGE_SETTINGS", "");

  // Initialize locale from localStorage on service creation
  if (savedLocale.value && i18n.global.availableLocales.includes(savedLocale.value)) {
    i18n.global.locale.value = savedLocale.value;
  }

  const currentLocale = computed(() => {
    if (i18n.global.availableLocales.includes(savedLocale.value)) {
      return savedLocale.value;
    }

    return i18n.global.locale.value;
  });

  function setLocale(locale: string) {
    // Update the global i18n locale
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
    if (!language) return "";
    const countryCode = getCountryCode(language);
    return new URL(`../../assets/icons/flags/${countryCode}.svg`, import.meta.url).href;
  }

  return {
    setLocale,
    currentLocale,
    getLocaleByTag,
    resolveCamelCaseLocale,
    getFlag,
    getCountryCode,
  };
}
