# ThemeSelector

Settings menu entry that shows the current theme and opens a cascading submenu to switch between registered themes. Uses `useTheme()` and shows a toast notification on change.

## When to Use

- Use inside the settings menu as a theme switching control
- When the application has multiple registered themes (light, dark, etc.)
- Do NOT use standalone outside the settings menu context

## Basic Usage

```vue
<script setup lang="ts">
import { ThemeSelector } from "@vc-shell/framework";
</script>

<template>
  <ThemeSelector />
</template>
```

Typically registered through the settings menu service:

```ts
import { useSettingsMenu } from "@vc-shell/framework";
import { ThemeSelector } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: "theme-selector",
  group: "preferences",
  order: 10,
  component: ThemeSelector,
});
```

## Key Props

This component has no props. Themes are managed via the `useTheme()` composable.

## Common Patterns

### Registering custom themes

```ts
import { useTheme } from "@vc-shell/framework";

const { register } = useTheme();
register([{ key: "dark" }, { key: "green" }]);
```

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [LanguageSelector](../language-selector/language-selector.docs.md) -- sibling preference entry
