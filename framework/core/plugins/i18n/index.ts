import { createI18n, type PluralizationRule } from "vue-i18n";

// The plural forms a language writes in a message ("a | b | c"), in order, by Intl.PluralRules category.
// Languages not listed use vue-i18n's default: "singular | plural".
const PLURAL_FORMS: Record<string, Intl.LDMLPluralRule[]> = {
  ar: ["zero", "one", "two", "few", "many", "other"],
  fr: ["one", "other"],
  ja: ["other"],
  pl: ["one", "few", "many"],
  ru: ["one", "few", "many"],
  zh: ["other"],
};

function pluralRule(locale: string, forms: Intl.LDMLPluralRule[]): PluralizationRule {
  const rules = new Intl.PluralRules(locale);
  return (choice, choicesLength, orgRule) => {
    // A message written with another number of forms keeps vue-i18n's default choice.
    if (choicesLength !== forms.length) {
      return orgRule ? orgRule(choice, choicesLength) : 0;
    }
    const index = forms.indexOf(rules.select(Math.abs(choice)));
    // Categories a message has no form for (e.g. fractions) take the last form.
    return index === -1 ? forms.length - 1 : index;
  };
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
  formatFallbackMessages: true,
  pluralRules: Object.fromEntries(
    Object.entries(PLURAL_FORMS).map(([locale, forms]) => [locale, pluralRule(locale, forms)]),
  ),
});

export { i18n };
