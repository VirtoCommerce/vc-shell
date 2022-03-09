import { App } from "vue";
import {
  Composer,
  createI18n,
  useI18n as VueUseI18n,
  VueMessageType,
} from "vue-i18n";

export function init(app: App): App {
  console.debug(`[@virtoshell/core#useI18n:init] - Entry point`);
  const i18nPlugin = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "en",
    fallbackLocale: "en",
  });
  app.use(i18nPlugin);

  app.config.globalProperties.$mergeLocaleMessage =
    i18nPlugin.global.mergeLocaleMessage;

  return app;
}

export default function useI18n(): Composer<
  unknown,
  unknown,
  unknown,
  VueMessageType
> {
  console.debug(`[@virtoshell/core#useI18n] - Entry point`);
  return VueUseI18n({ useScope: "global" });
}
