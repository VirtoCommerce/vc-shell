# LanguageSelector

Settings menu entry that displays the current UI language and opens a cascading submenu for switching between available locales. Uses the framework `useLanguages` composable and global i18n locale list.

## When to Use

- Use inside the settings menu as a language switching control
- When you need the user to change the application locale at runtime
- Do NOT use standalone outside the settings menu context

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

## Common Patterns

### Pre-selecting a language

```ts
import { useLanguages } from "@vc-shell/framework";

const { setLocale } = useLanguages();
setLocale("de");
```

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- sibling preference entry
