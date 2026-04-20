# SettingsMenu

Container component that renders registered settings menu items grouped by category and sorted by order. Items are registered through the `useSettingsMenu` service, not through component props. This decoupled architecture allows any module in the application to contribute settings entries without modifying the menu component itself.

The menu is typically rendered inside the `UserDropdownButton` dropdown and provides account actions (change password, logout) and preference controls (theme, language).

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

## Recipe: Full Module Settings Registration

A typical module registers all its settings entries during the module install phase:

```ts
// my-module/index.ts
import { markRaw } from "vue";
import { useSettingsMenu, ThemeSelector, LanguageSelector, ChangePasswordButton, LogoutButton } from "@vc-shell/framework";

export default {
  install() {
    const settingsMenu = useSettingsMenu();

    // Preferences group (order controls position within the group)
    settingsMenu.register({
      id: "theme-selector",
      group: "preferences",
      order: 10,
      component: ThemeSelector,
    });

    settingsMenu.register({
      id: "language-selector",
      group: "preferences",
      order: 20,
      component: LanguageSelector,
    });

    // Account group
    settingsMenu.register({
      id: "change-password",
      group: "account",
      order: 30,
      component: ChangePasswordButton,
    });

    settingsMenu.register({
      id: "logout-button",
      group: "account",
      order: 100,
      component: LogoutButton,
    });
  },
};
```

## Common Patterns

### Registration options

| Option      | Type        | Required | Description                                                |
| ----------- | ----------- | -------- | ---------------------------------------------------------- |
| `id`        | `string`    | Yes      | Unique identifier for the entry                            |
| `group`     | `string`    | Yes      | Group name (entries are grouped and separated by dividers) |
| `order`     | `number`    | Yes      | Sort order within the group (lower = higher position)      |
| `component` | `Component` | Yes      | Vue component to render as the menu item                   |

### Group rendering

Groups are separated by a horizontal divider and items within each group are sorted by `order`. Common group names used by convention:

| Group           | Description                               | Typical order range |
| --------------- | ----------------------------------------- | ------------------- |
| `"preferences"` | User preferences (theme, language)        | 10-29               |
| `"account"`     | Account actions (change password, logout) | 30-100              |

## Details

- **Service-driven content**: The menu has no props and renders entirely from the `useSettingsMenu()` registry. This makes it fully extensible -- any module can add entries.
- **CloseSettingsMenuKey injection**: The menu provides a `CloseSettingsMenuKey` injection to its children. Menu items inject this to close the dropdown before performing their action (e.g., opening a popup or navigating).
- **Ordering**: Items are sorted by `order` within their group. Use consistent order ranges across modules to maintain a predictable menu layout.
- **Dynamic registration**: Items can be registered at any time, but registering during module `install()` ensures they are available when the menu first renders.

## Tips

- Use conventional group names (`"preferences"`, `"account"`) to keep the menu organized across modules.
- The `order` value determines position within a group. Leave gaps between values (10, 20, 30) to make it easy to insert new entries later.
- Menu item components should inject `CloseSettingsMenuKey` and call it before performing navigation to avoid the menu staying open over the new content.
- The logout button should always have the highest `order` value in the `"account"` group to appear last.

## Related Components

- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- individual menu row
- [UserDropdownButton](../user-dropdown-button/user-dropdown-button.docs.md) -- opens the settings menu
- [ThemeSelector](../theme-selector/theme-selector.docs.md) -- theme picker entry
- [LanguageSelector](../language-selector/language-selector.docs.md) -- language picker entry
- [ChangePasswordButton](../change-password-button/change-password-button.docs.md) -- password change action
- [LogoutButton](../logout-button/logout-button.docs.md) -- sign-out action
