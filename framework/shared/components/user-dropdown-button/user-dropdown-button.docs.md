# UserDropdownButton

User account trigger displayed in the shell sidebar footer. Shows avatar, name, and role. On desktop it opens a floating settings menu dropdown; on mobile it opens a full sidebar panel.

## When to Use

- Use as the primary user account entry point in the sidebar/app bar
- When you need a responsive user menu that adapts to mobile/desktop
- Do NOT use as a generic dropdown button

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `undefined` | User display name |
| `role` | `string` | `undefined` | User role label |
| `avatarUrl` | `string` | `undefined` | URL for the user avatar image |
| `disabled` | `boolean` | `false` | Prevents menu from opening |

## Common Patterns

### Collapsed sidebar

When the sidebar is not pinned, the button collapses to show only the avatar. Expanding the sidebar reveals the full name and role text.

## Related Components

- [SettingsMenu](../settings-menu/settings-menu.docs.md) -- menu content rendered inside the dropdown
- [LogoutButton](../logout-button/logout-button.docs.md) -- sign-out action inside the menu
- [ChangePasswordButton](../change-password-button/change-password-button.docs.md) -- password change action
