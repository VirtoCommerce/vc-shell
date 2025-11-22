---
id: usePermissions-template-usage
type: FRAMEWORK_API
category: composable
tags: [composable, permissions, template]
title: "usePermissions - Template Usage"
description: "Using $hasAccess helper in Vue templates"
---

# usePermissions - Template Usage with $hasAccess

VC-Shell provides a global `$hasAccess` helper that can be used directly in templates without importing usePermissions.

## Overview

- Global `$hasAccess()` function available in all templates
- Same API as `hasAccess` from usePermissions
- Simpler syntax for template conditional rendering
- No need to create computed properties

## Basic Template Usage

```vue
<template>
  <VcBlade title="Offers Management">
    <!-- Single permission check -->
    <VcButton v-if="$hasAccess('offers:create')" @click="onCreate">
      Create Offer
    </VcButton>

    <!-- Multiple permissions (OR logic) -->
    <div v-if="$hasAccess(['offers:read', 'offers:manage'])">
      <VcTable :items="offers" />
    </div>

    <!-- Show message if no permission -->
    <div v-else>
      <VcBanner>You don't have permission to view offers</VcBanner>
    </div>
  </VcBlade>
</template>
```

## Conditional Rendering

```vue
<template>
  <VcBlade title="Offer Details">
    <!-- Form fields - editable only with update permission -->
    <VcForm>
      <VcInput
        v-model="offer.name"
        label="Name"
        :disabled="!$hasAccess('offers:update')"
      />

      <VcInput
        v-model="offer.price"
        label="Price"
        :disabled="!$hasAccess('offers:update')"
      />
    </VcForm>

    <!-- Toolbar actions -->
    <template #toolbar>
      <VcButton
        v-if="$hasAccess('offers:update')"
        @click="onSave"
      >
        Save
      </VcButton>

      <VcButton
        v-if="$hasAccess('offers:delete')"
        @click="onDelete"
        variant="danger"
      >
        Delete
      </VcButton>
    </template>
  </VcBlade>
</template>
```

## Table Actions Column

```vue
<template>
  <VcTable
    :items="offers"
    :columns="columns"
  >
    <!-- Show actions only if user has edit or delete permission -->
    <template
      v-if="$hasAccess(['offers:update', 'offers:delete'])"
      #item_actions="{ item }"
    >
      <div class="tw-flex tw-gap-2">
        <VcButton
          v-if="$hasAccess('offers:update')"
          @click="onEdit(item)"
          size="small"
        >
          Edit
        </VcButton>

        <VcButton
          v-if="$hasAccess('offers:delete')"
          @click="onDelete(item)"
          size="small"
          variant="danger"
        >
          Delete
        </VcButton>
      </div>
    </template>
  </VcTable>
</template>
```

## Complex Permission Logic

```vue
<template>
  <VcBlade title="Settings">
    <!-- Show if user is admin OR has settings permission -->
    <div v-if="$hasAccess(['admin:access', 'settings:manage'])">
      <VcCard header="General Settings">
        <div class="tw-p-4">
          <!-- Only admins can change these -->
          <VcInput
            v-model="settings.appName"
            label="Application Name"
            :disabled="!$hasAccess('admin:access')"
          />
        </div>
      </VcCard>
    </div>

    <!-- Show different message for regular users -->
    <div v-else>
      <VcBanner variant="warning">
        Contact your administrator to change settings
      </VcBanner>
    </div>
  </VcBlade>
</template>
```

## Navigation Menu with Permissions

```vue
<template>
  <nav class="tw-space-y-2">
    <VcButton
      v-if="$hasAccess('dashboard:read')"
      @click="goTo('/dashboard')"
      full-width
    >
      Dashboard
    </VcButton>

    <VcButton
      v-if="$hasAccess('offers:read')"
      @click="goTo('/offers')"
      full-width
    >
      Offers
    </VcButton>

    <VcButton
      v-if="$hasAccess('products:read')"
      @click="goTo('/products')"
      full-width
    >
      Products
    </VcButton>

    <VcButton
      v-if="$hasAccess(['admin:access', 'settings:read'])"
      @click="goTo('/settings')"
      full-width
    >
      Settings
    </VcButton>
  </nav>
</template>
```

## Combining with v-show

```vue
<template>
  <!-- v-if: completely removes element if no permission -->
  <VcButton v-if="$hasAccess('offers:create')" @click="onCreate">
    Create
  </VcButton>

  <!-- v-show: hides element but keeps it in DOM -->
  <VcButton v-show="$hasAccess('offers:update')" @click="onEdit">
    Edit
  </VcButton>

  <!-- Use v-if for sensitive data (better security) -->
  <!-- Use v-show for frequently toggled elements (better performance) -->
</template>
```

## Disabled State with Tooltip

```vue
<template>
  <VcButton
    @click="onDelete"
    :disabled="!$hasAccess('offers:delete')"
    :tooltip="
      $hasAccess('offers:delete')
        ? 'Delete this offer'
        : 'You don\'t have permission to delete offers'
    "
  >
    Delete
  </VcButton>
</template>
```

## Dynamic Class Binding

```vue
<template>
  <div
    :class="{
      'tw-opacity-50': !$hasAccess('offers:update'),
      'tw-cursor-not-allowed': !$hasAccess('offers:update'),
    }"
  >
    <VcForm>
      <!-- Form fields -->
    </VcForm>
  </div>
</template>
```

## Slot Content with Permissions

```vue
<template>
  <VcCard header="Offer Details">
    <template #actions>
      <!-- Only show actions if user has permissions -->
      <div v-if="$hasAccess(['offers:update', 'offers:delete'])">
        <VcButton
          v-if="$hasAccess('offers:update')"
          @click="onEdit"
        >
          Edit
        </VcButton>
        <VcButton
          v-if="$hasAccess('offers:delete')"
          @click="onDelete"
        >
          Delete
        </VcButton>
      </div>
    </template>

    <div class="tw-p-4">
      <!-- Card content -->
    </div>
  </VcCard>
</template>
```

## Using with Computed Text

```vue
<template>
  <VcBlade :title="bladeTitle">
    <div v-if="$hasAccess('offers:read')">
      <VcTable :items="offers" />
    </div>
    <div v-else>
      <VcBanner>No access</VcBanner>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";

const bladeTitle = computed(() =>
  $hasAccess("offers:manage")
    ? "Manage Offers"
    : "View Offers"
);
</script>
```

## Comparison: $hasAccess vs hasAccess

### Template Usage - $hasAccess (Recommended)

```vue
<template>
  <!-- Direct usage in template -->
  <VcButton v-if="$hasAccess('offers:create')" @click="onCreate">
    Create
  </VcButton>
</template>

<script setup lang="ts">
// No import needed!
</script>
```

### Script Usage - hasAccess

```vue
<template>
  <VcButton v-if="canCreate" @click="onCreate">
    Create
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePermissions } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const canCreate = computed(() => hasAccess("offers:create"));
</script>
```

## When to Use Each

### Use $hasAccess in template when:
- Simple permission check in v-if/v-show
- One-time check in template
- Cleaner template syntax preferred

### Use hasAccess in script when:
- Need computed property for multiple uses
- Complex permission logic
- Permission check in functions
- Better type safety needed

## Important Notes

### ✅ DO

- Use `$hasAccess` directly in templates for simple checks
- Use v-if for sensitive data (better security)
- Provide helpful messages when access is denied
- Combine with :disabled for better UX

### ❌ DON'T

- Don't use complex logic in template `$hasAccess` calls
- Don't forget server-side permission validation
- Don't use v-show for sensitive data (element still in DOM)

## Permission Patterns

```vue
<template>
  <!-- Read-only view -->
  <div v-if="$hasAccess('offers:read')">
    <VcField label="Name" :model-value="offer.name" />
  </div>

  <!-- Edit mode -->
  <div v-if="$hasAccess('offers:update')">
    <VcInput v-model="offer.name" label="Name" />
  </div>

  <!-- Admin-only section -->
  <div v-if="$hasAccess('admin:access')">
    <!-- Advanced settings -->
  </div>
</template>
```

## See Also

- [basic-check.md](./basic-check.md) - Using hasAccess in script setup
- [useUser basic-usage.md](../useUser/basic-usage.md) - User information

**Reference:** [Official VC-Shell Documentation - usePermissions](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/usePermissions/)
