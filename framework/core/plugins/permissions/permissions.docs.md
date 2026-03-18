# Permissions Plugin

Permission-based access control plugin. Exposes a global `$hasAccess` helper for checking user permissions throughout the application.

## Overview

The VirtoCommerce platform uses a role-based permission system where each user is assigned one or more roles, and each role grants a set of named permissions (e.g., `order:read`, `order:create`, `catalog:manage`). The permissions plugin bridges this system into the Vue application layer so that UI elements can be shown or hidden based on the current user's access rights.

The plugin installs the `hasAccess()` function from the `usePermissions()` composable as both a Vue global property (`$hasAccess`) and a provide/inject injectable (`"$hasAccess"`). This means permission checks are available everywhere: in templates via `$hasAccess()`, in composition API code via `usePermissions()`, and in any injecting component.

The framework installs this plugin automatically during app setup. Module developers never need to register it manually.

## Installation / Registration

```typescript
// Automatic -- installed by the framework during app setup.
// The plugin source is straightforward:
import { usePermissions } from "@core/composables/usePermissions";
import { App } from "vue";

export const permissions = {
  install(app: App) {
    const { hasAccess } = usePermissions();
    app.config.globalProperties.$hasAccess = hasAccess;
    app.provide("$hasAccess", hasAccess);
  },
};
```

Module developers use the composable or global property directly -- no registration needed.

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
  <!-- Single permission check -->
  <VcButton v-if="$hasAccess('order:create')">
    Create Order
  </VcButton>

  <!-- Multiple permissions (OR logic: any one is enough) -->
  <VcButton v-if="$hasAccess(['order:update', 'order:manage'])">
    Edit Order
  </VcButton>

  <!-- No permission required (undefined = always visible) -->
  <VcButton v-if="$hasAccess(undefined)">
    View Dashboard
  </VcButton>
</template>
```

### In Composition API

```typescript
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

if (hasAccess(["order:read", "order:manage"])) {
  // User has at least one of these permissions
  loadOrderData();
}

// Guard an entire blade setup
if (!hasAccess("catalog:manage")) {
  notification.warning("You do not have access to manage the catalog");
  return;
}
```

### On Blade Definitions

Permissions declared on blades are enforced by the framework during navigation. If the user lacks the required permissions, the blade will not open:

```typescript
// In a module definition
export default defineAppModule({
  blades: {
    OrdersList: {
      component: OrdersListBlade,
      route: "orders",
      permissions: ["order:read"],  // Required to access this blade
    },
    OrderDetails: {
      component: OrderDetailsBlade,
      permissions: ["order:read", "order:manage"],  // OR logic
    },
  },
});
```

### Toolbar Button Visibility

Toolbar buttons support a `permissions` property that works the same way:

```typescript
const toolbar = useToolbar([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    permissions: "order:update",  // Only shown if user has this permission
    clickHandler: () => saveOrder(),
  },
  {
    id: "delete",
    title: "Delete",
    icon: "lucide-trash",
    permissions: ["order:delete", "order:manage"],
    clickHandler: () => deleteOrder(),
  },
]);
```

## Tip: Permission Naming Convention

VirtoCommerce uses a `module:action` naming convention for permissions. Common patterns:

- `order:read` -- view orders
- `order:create` -- create new orders
- `order:update` -- modify existing orders
- `order:delete` -- delete orders
- `order:manage` -- full management access (often a superset)

When checking permissions, prefer specific actions over broad `manage` permissions to enable fine-grained access control.

## Common Mistake

Remember that `hasAccess` uses OR logic for arrays, not AND. If you need to check that a user has ALL permissions, chain multiple calls:

```typescript
// OR logic (default): user needs at least ONE
if (hasAccess(["order:read", "order:create"])) { ... }

// AND logic: user needs ALL
if (hasAccess("order:read") && hasAccess("order:create")) { ... }
```

## Related

- `framework/core/composables/usePermissions/` -- the underlying composable implementation
- `framework/core/composables/useUserManagement/` -- provides the `user` ref with permissions array
- `framework/core/plugins/modularity/` -- reads blade `permissions` during registration
- `framework/core/types/index.ts` -- `IBladeToolbar.permissions` type definition
