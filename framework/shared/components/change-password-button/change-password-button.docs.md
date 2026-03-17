# ChangePasswordButton

Settings menu action that opens the change-password popup through the popup handler system. Injects `CloseSettingsMenuKey` to dismiss the parent menu before showing the password form.

## When to Use

- Use as the password change action inside the settings menu
- When you need a standardized "change password" entry that opens the built-in password form
- Do NOT use outside the settings menu context

## Basic Usage

```vue
<script setup lang="ts">
import { ChangePasswordButton } from "@vc-shell/framework";
</script>

<template>
  <ChangePasswordButton />
</template>
```

Typically registered through the settings menu service:

```ts
import { useSettingsMenu } from "@vc-shell/framework";
import { ChangePasswordButton } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: "change-password",
  group: "account",
  order: 30,
  component: ChangePasswordButton,
});
```

## Key Props

This component has no props. It uses `usePopup()` to open the ChangePassword form and `useUserManagement()` internally for password validation.

## Prerequisites

A `VcPopupContainer` must be mounted in the component tree for the popup to render.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [LogoutButton](../logout-button/logout-button.docs.md) -- sibling account action
