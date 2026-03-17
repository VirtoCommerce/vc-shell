# LogoutButton

Settings menu action that signs the user out, closes all open blades, and redirects to the login page. Injects `CloseSettingsMenuKey` to dismiss the parent menu before navigation.

## When to Use

- Use as the sign-out action inside the settings menu
- When you need a standardized logout flow that respects unsaved blade changes
- Do NOT use outside the settings menu context

## Basic Usage

```vue
<script setup lang="ts">
import { LogoutButton } from "@vc-shell/framework";
</script>

<template>
  <LogoutButton />
</template>
```

Typically registered through the settings menu service:

```ts
import { useSettingsMenu } from "@vc-shell/framework";
import { LogoutButton } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: "logout-button",
  group: "account",
  order: 100,
  component: LogoutButton,
});
```

## Key Props

This component has no props. It uses `useUserManagement()` for sign-out and `useBladeNavigation()` to close blades.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [ChangePasswordButton](../change-password-button/change-password-button.docs.md) -- sibling account action
