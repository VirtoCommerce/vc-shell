# LanguageSelector

Settings menu entry that displays the current UI language and opens a cascading submenu for switching between available locales. Uses the framework `useLanguages` composable and the global vue-i18n locale list. When the user selects a different language, the entire application UI updates immediately without a page reload.

## When to Use

- Use inside the settings menu as a language switching control
- When you need the user to change the application locale at runtime
- Do NOT use standalone outside the settings menu context (it depends on SettingsMenu infrastructure)
- Do NOT confuse with `MultilanguageSelector`, which switches the content editing language for multilingual entities

## Basic Usage

```vue
<script setup lang="ts">
import { LanguageSelector } from "@vc-shell/framework";
</script>

<template>
  <LanguageSelector />
</template>
```

Typically registered through the settings menu service rather than used directly:

```ts
import { useSettingsMenu } from "@vc-shell/framework";
import { LanguageSelector } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: "language-selector",
  group: "preferences",
  order: 20,
  component: LanguageSelector,
});
```

## Key Props

This component has no props. It reads available locales from vue-i18n and manages locale state through `useLanguages()`.

## Recipe: Adding a New Locale to the Application

To make a new language available in the selector, register it with vue-i18n in your application setup:

```ts
// app setup or module install
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { en, de, fr },
});
```

The `LanguageSelector` automatically picks up all registered locales from the vue-i18n instance. No additional configuration is needed for the component itself.

## Recipe: Programmatic Locale Change

If you need to change the locale from code (e.g., based on user profile settings on login):

```ts
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, setLocale, availableLocales } = useLanguages();

// Set locale on login based on user preference
async function onLogin(user) {
  if (user.preferredLocale && availableLocales.value.includes(user.preferredLocale)) {
    setLocale(user.preferredLocale);
  }
}
```

## Details

- **Locale persistence**: The selected locale is persisted so it survives page reloads. On next visit, the application restores the user's last chosen language.
- **Cascading submenu**: On desktop, selecting the language entry opens a submenu listing all available locales. The current locale is highlighted with a checkmark.
- **Immediate effect**: Changing the locale updates all `{{ $t() }}` translations across the application instantly via vue-i18n's reactivity.
- **Locale display names**: Each locale is displayed with its native name (e.g., "Deutsch" for `de`, "Francais" for `fr`) when available.

## Tips

- The component only shows locales that have been registered with vue-i18n. If a locale file is missing, the language will not appear in the selector.
- Use the `check:locales` script (`yarn check:locales`) to validate that all locale files have the same keys. Missing keys fall back to the `fallbackLocale`.
- The `LanguageSelector` changes the UI language. To let users switch the content editing language for multilingual fields (e.g., product names), use the `MultilanguageSelector` component instead.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- sibling preference entry
- [MultilanguageSelector](../multilanguage-selector/multilanguage-selector.docs.md) -- content language picker (different purpose)
