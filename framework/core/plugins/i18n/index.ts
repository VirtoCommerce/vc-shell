import { createI18n } from "vue-i18n";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
});

export { i18n };
