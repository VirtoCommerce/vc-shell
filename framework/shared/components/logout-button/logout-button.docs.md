# LogoutButton

Settings menu action that signs the user out, closes all open blades, and redirects to the login page. This component encapsulates the full sign-out flow: it injects `CloseSettingsMenuKey` to dismiss the parent menu before navigation, calls `useUserManagement().signOut()` to clear the authentication token, and uses `useBladeNavigation()` to close any open blades so the user does not return to stale blade state on next login.

## When to Use

- Use as the sign-out action inside the settings menu
- When you need a standardized logout flow that respects unsaved blade changes
- Do NOT use outside the settings menu context (it depends on `CloseSettingsMenuKey` injection)

## Basic Usage

```vue
<script setup lang="ts">
import { LogoutButton } from "@vc-shell/framework";
</script>

<template>
  <LogoutButton />
</template>
```

Typically registered through the settings menu service rather than placed directly in a template:

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

## Recipe: Module with Complete Settings Menu Registration

When setting up a module, register all standard account actions together:

```ts
// my-module/index.ts
import { useSettingsMenu, LogoutButton, ChangePasswordButton } from "@vc-shell/framework";

export default {
  install(app) {
    const settingsMenu = useSettingsMenu();

    settingsMenu.register({
      id: "change-password",
      group: "account",
      order: 30,
      component: ChangePasswordButton,
    });

    settingsMenu.register({
      id: "logout-button",
      group: "account",
      order: 100,  // High order places it at the bottom
      component: LogoutButton,
    });
  },
};
```

## Details

- **Menu dismissal**: Before starting the sign-out flow, the component calls the injected `CloseSettingsMenuKey` function to close the dropdown. This prevents a visual artifact where the menu stays open while the page redirects.
- **Blade cleanup**: All open blades are closed via `useBladeNavigation()` before redirecting. This avoids orphaned blade state in the navigation stack.
- **Redirect**: After sign-out completes, the user is redirected to the `/login` route.
- **External providers**: If the user signed in through an external SSO provider, the sign-out flow also triggers the provider's logout redirect via `useExternalProvider().signOut()`.

## Tips

- The `order: 100` value in the registration example places the logout button at the bottom of the settings menu, which is the conventional position for destructive actions.
- If you need a custom sign-out flow (e.g., additional cleanup, analytics tracking), create a wrapper component that performs your logic before delegating to the standard `useUserManagement().signOut()`.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- parent container
- [SettingsMenuItem](../settings-menu-item/settings-menu-item.docs.md) -- base menu item used internally
- [ChangePasswordButton](../change-password-button/change-password-button.docs.md) -- sibling account action
