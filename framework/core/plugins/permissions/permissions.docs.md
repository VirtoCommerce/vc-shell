# Permissions Plugin

Permission-based access control plugin. Exposes a global `$hasAccess` helper for checking user permissions throughout the application.

## Overview

The permissions plugin bridges the `usePermissions()` composable into Vue's global properties and provide/inject system. It makes the `hasAccess()` function available in every component template via `$hasAccess` and injectable via the `"$hasAccess"` key. The framework installs this plugin automatically.

## Installation / Registration

```typescript
// Automatic -- installed by the framework during app setup.
// Module developers use the composable or global property directly.
```

## API

### Global Property

| Property | Type | Description |
|----------|------|-------------|
| `$hasAccess` | `(permissions: string \| string[] \| undefined) => boolean` | Checks if the current user has the required permission(s) |

### Composable: `usePermissions()`

| Export | Type | Description |
|--------|------|-------------|
| `hasAccess` | `(permissions: string \| string[] \| undefined) => boolean` | Returns `true` if the user has access |

#### `hasAccess` Logic

- Returns `true` if `permissions` is `undefined` or empty (no restriction)
- Returns `true` if the user is an administrator (`user.isAdministrator`)
- For a `string`: checks if the user's permissions list includes it
- For a `string[]`: returns `true` if the user has **any** of the listed permissions (OR logic)

## Usage

### In Templates

```vue
<template>
  <VcButton v-if="$hasAccess('order:create')">
    Create Order
  </VcButton>
</template>
```

### In Composition API

```typescript
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

if (hasAccess(["order:read", "order:manage"])) {
  // User has at least one of these permissions
}
```

### On Blade Definitions

Permissions declared on blades are enforced by the framework during navigation:

```typescript
export default defineAppModule({
  blades: { OrdersList }, // OrdersList has: permissions: ["order:read"]
});
```

## Related

- `framework/core/composables/usePermissions/` -- the underlying composable implementation
- `framework/core/composables/useUserManagement/` -- provides the `user` ref with permissions array
- `framework/core/plugins/modularity/` -- reads blade `permissions` during registration
