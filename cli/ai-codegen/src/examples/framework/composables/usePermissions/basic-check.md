---
id: usePermissions-basic-check
type: FRAMEWORK_API
category: composable
tags: [composable, permissions, authorization]
title: "usePermissions - Basic Permission Check"
description: "Check user permissions in script setup"
---

# usePermissions - Basic Permission Check

The `usePermissions` composable provides methods to check if the current user has specific permissions.

## Overview

- Check single permission
- Check multiple permissions (OR logic)
- Reactive permission checking
- Works with user's permission list

## Basic Usage

```typescript
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Check single permission
const canManageOffers = hasAccess("offers:manage");

// Check multiple permissions (OR logic - user needs ANY of these)
const canAccessOffers = hasAccess(["offers:read", "offers:manage"]);
```

## Complete Example - Conditional Toolbar

```vue
<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";
import { IBladeToolbar } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Toolbar items based on permissions
const bladeToolbar = computed<IBladeToolbar[]>(() => {
  const items: IBladeToolbar[] = [];

  // Add button - requires create permission
  if (hasAccess("offers:create")) {
    items.push({
      id: "add",
      title: "Add Offer",
      icon: "material-plus",
      clickHandler: onAdd,
    });
  }

  // Edit button - requires update permission
  if (hasAccess("offers:update")) {
    items.push({
      id: "edit",
      title: "Edit",
      icon: "material-edit",
      clickHandler: onEdit,
    });
  }

  // Delete button - requires delete permission
  if (hasAccess("offers:delete")) {
    items.push({
      id: "delete",
      title: "Delete",
      icon: "material-delete",
      clickHandler: onDelete,
    });
  }

  return items;
});
</script>
```

## Conditional Rendering

```vue
<template>
  <VcBlade title="Offers">
    <!-- Only show create button if user has permission -->
    <VcButton v-if="canCreate" @click="onCreate">Create New</VcButton>

    <!-- @vue-generic {IOffer} -->
    <VcTable
      :items="offers"
      :columns="columns"
      @item-click="onItemClick"
    >
      <!-- Only show actions column if user can edit or delete -->
      <template v-if="canModify" #item_actions="{ item }">
        <VcButton v-if="canEdit" @click="onEdit(item)">Edit</VcButton>
        <VcButton v-if="canDelete" @click="onDelete(item)">Delete</VcButton>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Define permission checks
const canCreate = computed(() => hasAccess("offers:create"));
const canEdit = computed(() => hasAccess("offers:update"));
const canDelete = computed(() => hasAccess("offers:delete"));
const canModify = computed(() => hasAccess(["offers:update", "offers:delete"]));
</script>
```

## Permission-Based Navigation

```typescript
import { usePermissions } from "@vc-shell/framework";
import { useBladeNavigation } from "@vc-shell/framework";
import OfferDetails from "./OfferDetails.vue";

const { hasAccess } = usePermissions();
const { openBlade } = useBladeNavigation();

function onItemClick(item: { id: string }) {
  // Only open details if user can read offers
  if (hasAccess("offers:read")) {
    openBlade({
      blade: OfferDetails,
      param: item.id,
    });
  } else {
    showError("You don't have permission to view offer details");
  }
}
```

## Multiple Permission Check (OR Logic)

```typescript
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// User needs ANY of these permissions
const canAccessSettings = computed(() =>
  hasAccess([
    "settings:read",
    "settings:update",
    "admin:access"
  ])
);

// Show settings menu if user has any admin permission
const isAdmin = computed(() =>
  hasAccess([
    "admin:access",
    "admin:users",
    "admin:settings"
  ])
);
```

## Function-Based Permission Check

```typescript
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Create helper function for permission checking
function canPerformAction(action: "create" | "read" | "update" | "delete"): boolean {
  return hasAccess(`offers:${action}`);
}

// Usage
if (canPerformAction("update")) {
  // Allow editing
}

if (canPerformAction("delete")) {
  // Allow deletion
}
```

## Computed Properties for Permissions

```typescript
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

// Define all permission checks as computed properties
const permissions = computed(() => ({
  canCreate: hasAccess("offers:create"),
  canRead: hasAccess("offers:read"),
  canUpdate: hasAccess("offers:update"),
  canDelete: hasAccess("offers:delete"),
  canManage: hasAccess("offers:manage"),
  isReadOnly: hasAccess("offers:read") && !hasAccess(["offers:update", "offers:delete"]),
}));

// Usage
if (permissions.value.canCreate) {
  // Show create button
}

if (permissions.value.isReadOnly) {
  // Disable all editing
}
```

## Guard Function

```typescript
import { usePermissions } from "@vc-shell/framework";
import { usePopup } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const { showError } = usePopup();

// Guard function - throws if no permission
function requirePermission(permission: string | string[]): void {
  if (!hasAccess(permission)) {
    showError("You don't have permission to perform this action");
    throw new Error("Permission denied");
  }
}

// Usage
async function deleteOffer(id: string) {
  requirePermission("offers:delete"); // Throws if no permission

  // Proceed with deletion
  await deleteOfferAPI(id);
}
```

## Disable Controls Based on Permissions

```vue
<template>
  <VcForm>
    <VcInput
      v-model="offer.name"
      label="Offer Name"
      :disabled="!canEdit"
    />

    <VcInput
      v-model="offer.price"
      label="Price"
      :disabled="!canEdit"
    />

    <VcButton
      @click="onSave"
      :disabled="!canEdit"
    >
      Save
    </VcButton>

    <VcButton
      @click="onDelete"
      :disabled="!canDelete"
    >
      Delete
    </VcButton>
  </VcForm>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();

const canEdit = computed(() => hasAccess("offers:update"));
const canDelete = computed(() => hasAccess("offers:delete"));
</script>
```

## API Reference

```typescript
interface UsePermissions {
  hasAccess(permission: string | string[]): boolean;
}
```

### Parameters

- **permission**: `string | string[]`
  - Single permission: `"offers:manage"`
  - Multiple permissions (OR logic): `["offers:read", "offers:manage"]`

### Return Value

- `boolean`: `true` if user has the permission(s), `false` otherwise
- For arrays: returns `true` if user has ANY of the permissions

## Important Notes

### ✅ DO

- Use computed properties for reactive permission checks
- Check permissions before performing sensitive operations
- Use arrays for OR logic (user needs ANY permission)
- Disable UI controls when user lacks permission
- Show appropriate error messages when denying actions

### ❌ DON'T

- Don't rely solely on client-side permission checks (always validate on server)
- Don't hardcode permission strings - use constants
- Don't forget to handle permission denial gracefully

## Permission Naming Convention

Follow consistent permission naming:

```typescript
// Resource:Action pattern
"offers:create"
"offers:read"
"offers:update"
"offers:delete"
"offers:manage" // All CRUD operations

"admin:access"
"admin:users"
"settings:update"
```

## See Also

- [template-usage.md](./template-usage.md) - Using $hasAccess in templates
- [useUser basic-usage.md](../useUser/basic-usage.md) - User information

**Reference:** [Official VC-Shell Documentation - usePermissions](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/usePermissions/)
