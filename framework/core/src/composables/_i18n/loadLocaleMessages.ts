import { Composer, LocaleMessages, VueMessageType } from "vue-i18n";

export default function loadLocaleMessages(
  i18n?: Composer
): LocaleMessages<VueMessageType> {
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
