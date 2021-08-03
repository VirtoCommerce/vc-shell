import { App } from "vue";
import { Composer, createI18n, useI18n as VueUseI18n } from "vue-i18n";

export function init(app: App): App {
  console.debug("Init i18n");
  const i18nPlugin = createI18n({
    legacy: false,
    globalInjection: true,
    locale: process.env.VUE_APP_I18N_LOCALE || "en",
    fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  });
  app.use(i18nPlugin);

  app.config.globalProperties.$mergeLocaleMessage =
    i18nPlugin.global.mergeLocaleMessage;

  return app;
}

export default function useI18n(): Composer {
  console.debug("useI18n entry point");
  return VueUseI18n();
}
