import { createI18n } from "vue-i18n";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: navigator.language.split("-")[0],
  fallbackLocale: "en",
  formatFallbackMessages: true,
});

export { i18n };
