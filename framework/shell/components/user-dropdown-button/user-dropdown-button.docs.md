# UserDropdownButton

User account trigger displayed in the shell sidebar footer. Shows the user's avatar, display name, and role. On desktop it opens a floating settings menu dropdown anchored to the button; on mobile it opens a full sidebar panel that slides in from the left. The component automatically adapts its layout based on the sidebar's expanded/collapsed state.

## When to Use

- Use as the primary user account entry point in the sidebar/app bar
- When you need a responsive user menu that adapts to mobile and desktop viewports
- Do NOT use as a generic dropdown button -- it is purpose-built for the user account context

## Basic Usage

```vue
<script setup lang="ts">
import { UserDropdownButton } from "@vc-shell/framework";
</script>

<template>
  <UserDropdownButton
    name="Jane Doe"
    role="Vendor Manager"
    avatar-url="https://example.com/avatar.jpg"
  />
</template>
```

## Key Props

| Prop        | Type      | Default     | Description                   |
| ----------- | --------- | ----------- | ----------------------------- |
| `name`      | `string`  | `undefined` | User display name             |
| `role`      | `string`  | `undefined` | User role label               |
| `avatarUrl` | `string`  | `undefined` | URL for the user avatar image |
| `disabled`  | `boolean` | `false`     | Prevents menu from opening    |

## Recipe: Wiring to User Management Composable

In practice, the user data comes from the authentication system:

```vue
<script setup lang="ts">
import { computed } from "vue";
import { UserDropdownButton } from "@vc-shell/framework";
import { useUserManagement } from "@vc-shell/framework";

const { currentUser } = useUserManagement();

const displayName = computed(() => (currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : ""));
const role = computed(() => currentUser.value?.roles?.[0]?.name ?? "");
const avatarUrl = computed(() => currentUser.value?.photoUrl);
</script>

<template>
  <UserDropdownButton
    :name="displayName"
    :role="role"
    :avatar-url="avatarUrl"
  />
</template>
```

## Common Patterns

### Collapsed sidebar

When the sidebar is not pinned open, the button collapses to show only the avatar in a compact circular layout. Hovering over or expanding the sidebar reveals the full name and role text. This behavior is automatic based on the sidebar expansion state.

### Mobile behavior

On mobile viewports (`$isMobile`), clicking the button opens a full-height slide-in panel instead of a floating dropdown. This panel contains the same SettingsMenu content but provides a better touch experience with larger tap targets and a close button.

## Details

- **Dropdown positioning**: On desktop, the dropdown is positioned using a floating UI library to avoid viewport overflow. It anchors to the button element and adjusts placement dynamically.
- **Settings menu content**: The dropdown renders the `SettingsMenu` component, which displays all items registered via `useSettingsMenu()` (theme selector, language selector, change password, logout, etc.).
- **Click-outside**: The dropdown closes when the user clicks anywhere outside the menu. On mobile, the panel has an explicit close button.
- **Avatar fallback**: When no `avatarUrl` is provided, a default user icon is displayed.

## Tips

- The component is typically placed in the sidebar footer slot of the app shell. You rarely need to instantiate it manually -- the framework shell handles its placement.
- If `disabled` is `true`, clicking the button does nothing and the menu does not open. Use this during critical operations where navigation should be prevented.
- All menu items are driven by `useSettingsMenu()` registrations. To add custom items to the user menu, register them via the service rather than modifying this component.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- menu content rendered inside the dropdown
- [LogoutButton](../logout-button/logout-button.docs.md) -- sign-out action inside the menu
- [ChangePasswordButton](../change-password-button/change-password-button.docs.md) -- password change action
