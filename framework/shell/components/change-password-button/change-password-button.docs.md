# ChangePasswordButton

Settings menu action that opens the change-password popup through the popup handler system. This component bridges the settings menu and the password change form: it injects `CloseSettingsMenuKey` to dismiss the parent menu before showing the password popup, ensuring a clean transition. The popup itself renders a form with current password, new password, and confirm password fields, with real-time password policy validation.

## When to Use

- Use as the password change action inside the settings menu
- When you need a standardized "change password" entry that opens the built-in password form
- Do NOT use outside the settings menu context (it depends on `CloseSettingsMenuKey` injection)

## Basic Usage

```vue
<script setup lang="ts">
import { ChangePasswordButton } from "@vc-shell/framework";
</script>

<template>
  <ChangePasswordButton />
</template>
```

Typically registered through the settings menu service rather than placed directly:

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

## Recipe: Registering Account Actions in a Module

Combine with other account-related settings entries in a module setup:

```ts
// my-module/index.ts
import { useSettingsMenu, ChangePasswordButton, LogoutButton, ThemeSelector, LanguageSelector } from "@vc-shell/framework";

export default {
  install() {
    const settingsMenu = useSettingsMenu();

    // Preferences group
    settingsMenu.register({ id: "theme", group: "preferences", order: 10, component: ThemeSelector });
    settingsMenu.register({ id: "language", group: "preferences", order: 20, component: LanguageSelector });

    // Account group
    settingsMenu.register({ id: "change-password", group: "account", order: 30, component: ChangePasswordButton });
    settingsMenu.register({ id: "logout", group: "account", order: 100, component: LogoutButton });
  },
};
```

## Prerequisites

- A `VcPopupContainer` must be mounted in the component tree for the popup to render. This is automatically present in the standard vc-shell app shell.
- The component must be rendered within the settings menu context, which provides the `CloseSettingsMenuKey` injection.

## Details

- **Flow sequence**: Click button -> close settings menu -> open popup -> user fills form -> submit -> popup closes.
- **Password validation**: The popup form uses `useUserManagement().validatePassword()` to check the new password against the platform's password policy in real time (minimum length, required character classes, etc.).
- **Equal password detection**: If the user enters the same value for current and new password, the form shows a specific "Equal-passwords" error without making an API call.
- **Error handling**: API errors (e.g., incorrect current password) are displayed inline within the popup form.

## Tips

- The button renders as a `SettingsMenuItem` with a key/lock icon. Its label comes from the i18n key `SETTINGS.CHANGE_PASSWORD`.
- If you need to trigger password change from a different context (not the settings menu), use `usePopup()` directly with the ChangePassword component.
- The popup is modal -- the user must complete or cancel the password change before interacting with the rest of the application.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [LogoutButton](../logout-button/logout-button.docs.md) -- sibling account action
- [ChangePasswordPage](../../auth/ChangePasswordPage/change-password-page.docs.md) -- full-page variant for expired passwords
