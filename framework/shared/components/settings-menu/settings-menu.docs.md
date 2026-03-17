# SettingsMenu

Container component that renders registered settings menu items grouped by category and sorted by order. Items are registered through the `useSettingsMenu` service.

## When to Use

- Use as the main settings/preferences menu inside the user dropdown
- When you need a grouped, ordered list of settings actions
- Do NOT use for standalone menus unrelated to user settings

## Basic Usage

```vue
<script setup lang="ts">
import { SettingsMenu } from "@vc-shell/framework";
</script>

<template>
  <SettingsMenu />
</template>
```

Items are registered via the settings menu service, not through props:

```ts
import { useSettingsMenu } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();

settingsMenu.register({
  id: "my-theme-selector",
  group: "preferences",
  order: 10,
  component: ThemeSelector,
});
```

## Key Props

This component has no props. All content is driven by the settings menu service registration.

## Common Patterns

### Registering grouped items

```ts
settingsMenu.register({
  id: "theme-selector",
  group: "preferences",
  order: 10,
  component: ThemeSelector,
});

settingsMenu.register({
  id: "logout-button",
  group: "account",
  order: 100,
  component: LogoutButton,
});
```

Groups are separated by a horizontal divider and items within each group are sorted by `order`.

## Related Components

- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- individual menu row
- [UserDropdownButton](../user-dropdown-button/user-dropdown-button.docs.md) -- opens the settings menu
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- theme picker entry
- [LanguageSelector](../language-selector/language-selector.docs.md) -- language picker entry
