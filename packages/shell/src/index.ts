import { App, inject } from "vue";
import { createI18n, Composer, LocaleMessages, VueMessageType } from "vue-i18n";
import * as components from "./components";

function loadLocaleMessages(i18n?: Composer): LocaleMessages<VueMessageType> {
  const locales = require.context(
    "./locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages: LocaleMessages<VueMessageType> = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      if (i18n) {
        i18n.mergeLocaleMessage(locale, locales(key));
      }
      messages[locale] = locales(key);
    }
  });
  return messages;
}

export default {
  install(app: App, { extensions, locale }: IShellOptions): void {
    // Register provided extensions
    extensions.forEach((ext) => app.use(ext));

    // Globally register exported modules
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    const i18n = inject(app["__VUE_I18N_SYMBOL__"]) as Composer;
    if (i18n) {
      loadLocaleMessages(i18n);
    } else {
      const i18nPlugin = createI18n({
        legacy: false,
        locale: locale || process.env.VUE_APP_I18N_LOCALE || "en",
        fallbackLocale:
          locale || process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
        messages: loadLocaleMessages(),
      });
      app.use(i18nPlugin);
    }
  },
};

export * from "./components";
export * from "./composables";
