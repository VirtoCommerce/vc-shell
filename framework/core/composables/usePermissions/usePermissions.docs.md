# usePermissions

Checks whether the current user has specific platform permissions. Used for conditional UI rendering and access control.

## When to Use

- When conditionally showing/hiding UI elements based on user permissions
- When guarding blade access or toolbar button visibility
- When building permission-aware services (dashboard, menu)
- Do NOT use for server-side authorization -- this is client-side UI gating only

## Basic Usage

```typescript
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

if (hasAccess("order:update")) {
  // show edit button
}
```

## API

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `hasAccess` | `(permissions: string \| string[] \| undefined) => boolean` | Check if the current user has the required permission(s) |

### hasAccess Behavior

| Input | Result |
|-------|--------|
| `undefined` | `true` -- no permission required |
| `"order:read"` | `true` if user has this exact permission |
| `["order:read", "order:update"]` | `true` if user has **any** of the listed permissions (OR logic) |
| Administrator user | Always `true` regardless of permissions |

## Common Patterns

### Conditional rendering in a template

```typescript
<script setup lang="ts">
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const canEdit = computed(() => hasAccess("product:update"));
</script>

<template>
  <button v-if="canEdit" @click="onEdit">Edit</button>
</template>
```

### Guarding a toolbar action

```typescript
<script setup lang="ts">
import { usePermissions, useToolbar } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const { registerToolbarItem } = useToolbar();

if (hasAccess("order:delete")) {
  registerToolbarItem({
    id: "delete-order",
    title: "Delete",
    icon: "fas fa-trash",
    clickHandler: () => deleteOrder(),
  });
}
</script>
```

## Notes

- Permissions are loaded from the current user object via `useUserManagement()`.
- Administrator users (`user.isAdministrator`) bypass all permission checks.
- Permission strings use the platform format: `"module:action"` (e.g., `"order:read"`).

## Related

- [useBlade](../useBlade/) -- blade navigation (blades can declare required permissions)
- [useBladeRegistry](../useBladeRegistry/) -- blade registration includes permission metadata
