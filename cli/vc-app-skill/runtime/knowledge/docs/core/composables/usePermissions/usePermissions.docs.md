# usePermissions

Checks whether the current user has specific platform permissions. This composable reads the authenticated user's permission list and provides a `hasAccess` function for conditional UI rendering and access control. It is client-side only -- it does not enforce server-side authorization.

## When to Use

- Conditionally show or hide UI elements (buttons, toolbar items, sections) based on the current user's permissions
- Guard blade access or toolbar registration with client-side permission checks
- When NOT to use: as the sole authorization mechanism -- always pair with server-side enforcement; for checking authentication status -- use `useUser` instead

## Quick Start

```typescript
<script setup lang="ts">
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

if (hasAccess("order:update")) {
  // user can edit orders
}
</script>
```

## How Permission Checking Works

The `hasAccess` function evaluates permissions from the current user object (loaded via `useUserManagement`). The behavior depends on the input type and the user's role.

| Input | Result |
|-------|--------|
| `undefined` | `true` -- no permission required, everyone has access |
| `"order:read"` | `true` if the user has this exact permission string |
| `["order:read", "order:update"]` | `true` if the user has **any** of the listed permissions (OR logic) |
| Any value, administrator user | Always `true` -- administrators bypass all checks |

Permission strings follow the VirtoCommerce platform format: `"module:action"`. Common examples:

| Permission | Meaning |
|------------|---------|
| `"order:read"` | View orders |
| `"order:update"` | Edit orders |
| `"order:delete"` | Delete orders |
| `"catalog:create"` | Create catalog items |
| `"customer:manage"` | Full customer management |

## Conditional Rendering in Templates

Wrap permission checks in a `computed` to use them reactively in templates:

```typescript
<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

const canEdit = computed(() => hasAccess("product:update"));
const canDelete = computed(() => hasAccess("product:delete"));
const canManage = computed(() => hasAccess(["product:update", "product:delete"]));
</script>

<template>
  <div class="tw-flex tw-gap-2">
    <VcButton v-if="canEdit" variant="primary" @click="onEdit">
      Edit Product
    </VcButton>
    <VcButton v-if="canDelete" variant="danger" @click="onDelete">
      Delete
    </VcButton>
  </div>
</template>
```

## Guarding Toolbar Actions

A common pattern is to conditionally register toolbar buttons based on user permissions:

```typescript
<script setup lang="ts">
import { usePermissions, useToolbar } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const { registerToolbarItem } = useToolbar();

// Always register view-only actions
registerToolbarItem({
  id: "refresh",
  title: "Refresh",
  icon: "fas fa-sync",
  clickHandler: () => refresh(),
  priority: 50,
});

// Only register edit actions if the user has permission
if (hasAccess("order:update")) {
  registerToolbarItem({
    id: "save",
    title: "Save",
    icon: "fas fa-save",
    clickHandler: () => save(),
    priority: 100,
  });
}

if (hasAccess("order:delete")) {
  registerToolbarItem({
    id: "delete",
    title: "Delete",
    icon: "fas fa-trash",
    clickHandler: () => confirmDelete(),
    priority: 10,
  });
}
</script>
```

## Guarding Blade Access

Use `hasAccess` in a blade component to redirect users who lack the required permissions:

```typescript
<script setup lang="ts">
import { usePermissions, useBladeContext } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const { closeSelf } = useBladeContext();

if (!hasAccess("order:read")) {
  closeSelf();
  return;
}
</script>
```

## Guarding Menu and Dashboard Registrations

Both `addMenuItem` and `registerDashboardWidget` accept a `permissions` property. The menu service and dashboard service internally use the same permission-checking logic, so you often do not need to call `hasAccess` manually for these:

```typescript
import { addMenuItem, registerDashboardWidget } from "@vc-shell/framework";

// Menu item only visible to users with order:read
addMenuItem({
  title: "Orders",
  icon: "fas fa-shopping-cart",
  routeId: "OrdersList",
  priority: 10,
  permissions: "order:read",
});

// Dashboard widget only visible to users with analytics:view
registerDashboardWidget({
  id: "sales-chart",
  name: "Sales Chart",
  component: SalesChartWidget,
  size: { width: 2, height: 1 },
  permissions: ["analytics:view"],
});
```

## Recipes

### Multiple Permission Checks for Complex UI

```typescript
<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Build a permission map for the template
const permissions = computed(() => ({
  canView: hasAccess("product:read"),
  canEdit: hasAccess("product:update"),
  canDelete: hasAccess("product:delete"),
  canPublish: hasAccess("product:publish"),
  canManageAny: hasAccess(["product:update", "product:delete", "product:publish"]),
}));
</script>

<template>
  <VcCard header="Product Actions">
    <div v-if="permissions.canManageAny" class="tw-flex tw-gap-2 tw-p-4">
      <VcButton v-if="permissions.canEdit" @click="edit">Edit</VcButton>
      <VcButton v-if="permissions.canPublish" @click="publish">Publish</VcButton>
      <VcButton v-if="permissions.canDelete" variant="danger" @click="remove">Delete</VcButton>
    </div>
    <p v-else class="tw-p-4 tw-text-gray-500">You do not have permission to manage this product.</p>
  </VcCard>
</template>
```

### Reusable Permission Guard Composable

```typescript
// composables/useOrderPermissions.ts
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

export function useOrderPermissions() {
  const { hasAccess } = usePermissions();

  return {
    canView: computed(() => hasAccess("order:read")),
    canEdit: computed(() => hasAccess("order:update")),
    canDelete: computed(() => hasAccess("order:delete")),
    canRefund: computed(() => hasAccess("order:refund")),
  };
}
```

## Common Mistakes

### Checking permissions without wrapping in computed

```typescript
// Wrong -- evaluated once at setup, never updates if user changes
const canEdit = hasAccess("product:update");

// Correct -- reactive, re-evaluates when user data changes
const canEdit = computed(() => hasAccess("product:update"));
```

### Using AND logic instead of OR

```typescript
// Wrong -- hasAccess with an array uses OR logic, not AND
// This returns true if the user has EITHER permission
const canFullyManage = hasAccess(["order:update", "order:delete"]);

// Correct -- for AND logic, call hasAccess separately for each
const canFullyManage = hasAccess("order:update") && hasAccess("order:delete");
```

### Assuming server-side enforcement

```typescript
// Wrong -- relying only on client-side permission checks for security
if (hasAccess("order:delete")) {
  await client.deleteOrder(orderId); // server must also verify!
}

// Correct -- client-side check for UX, server enforces authorization
if (hasAccess("order:delete")) {
  try {
    await client.deleteOrder(orderId);
  } catch (e) {
    // Handle 403 Forbidden from server
  }
}
```

## API Reference

### Returns: `UsePermissionsReturn`

| Property | Type | Description |
|----------|------|-------------|
| `hasAccess` | `(permissions: string \| string[] \| undefined) => boolean` | Check if the current user has the required permission(s) |

### hasAccess Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `permissions` | `string \| string[] \| undefined` | No | Permission string, array of strings (OR logic), or `undefined` (always true) |

### Internal Behavior

- Permissions are read from `useUserManagement().user.value.permissions` at composable initialization.
- If `user.value.isAdministrator` is `true`, `hasAccess` always returns `true` regardless of the input.
- An array input uses OR logic: the user needs at least one of the listed permissions.
- Passing `undefined` returns `true`, allowing unrestricted access by default.

## Related

- [useToolbar](../useToolbar/) -- toolbar items can be conditionally registered based on permissions
- [useMenuService](../useMenuService/) -- menu items accept a `permissions` property for visibility filtering
- [useDashboard](../useDashboard/) -- dashboard widgets accept a `permissions` array for visibility filtering
- [useBlade](../useBlade/) -- blades can declare required permissions in their registration
