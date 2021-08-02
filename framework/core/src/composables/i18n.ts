import { App } from "vue";
import { Composer, createI18n, useI18n as VueUseI18n } from "vue-i18n";
import loadLocaleMessages from "./_i18n/loadLocaleMessages";

interface IuseI18n extends Composer {
  loadLocaleMessages: typeof loadLocaleMessages;
}

export function init(app: App): App {
  app.use(
    createI18n({
      legacy: false,
      locale: process.env.VUE_APP_I18N_LOCALE || "en",
      fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
    })
  );
  return app;
}

export default function useI18n(): IuseI18n {
  return {
    ...VueUseI18n(),
    loadLocaleMessages,
  };
}
