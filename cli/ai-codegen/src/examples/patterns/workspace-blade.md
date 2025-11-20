---
id: workspace-blade
type: PATTERN
complexity: MODERATE
pattern_category: general
category: navigation
critical: true
related_rules: ["09a"]
title: "Workspace Blade with Menu Item"
description: "Define menu items in defineOptions, not bootstrap.ts"
---

# Workspace Blade Pattern

## Overview

Menu items are defined in the workspace blade's `defineOptions`, NOT in bootstrap.ts!

Each module should have ONE workspace blade (usually the main list blade) with `isWorkspace: true` and `menuItem` configuration.

## Correct Pattern

```vue
<!-- ✅ CORRECT: src/modules/offers/pages/offers-list.vue -->
<template>
  <VcBlade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    :toolbar-items="bladeToolbar"
    width="70%"
    @close="$emit('close:blade')"
  >
    <VcTable
      :columns="columns"
      :items="items"
      :loading="loading"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue';

// ✅ CORRECT: Menu item defined in defineOptions
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← REQUIRED for workspace blade
  menuItem: {         // ← Menu item configuration HERE
    title: "OFFERS.MENU.TITLE",  // Use i18n key
    icon: "fas fa-tags",
    priority: 10,
    // Optional: group configuration
    groupConfig: {
      id: "management-group",
      title: "COMMON.GROUPS.MANAGEMENT"
    }
  },
  // Optional: permissions
  permissions: ["offers:manage"],
});

// Blade logic...
</script>
```

## defineOptions Fields

### Required for Workspace Blade

- **`isWorkspace: true`** - Marks this as a workspace blade
- **`menuItem`** - Menu item configuration

### menuItem Configuration

```typescript
menuItem: {
  title: string;        // i18n key (e.g., "MODULE.MENU.TITLE")
  icon: string;         // Icon (fas fa-*, lucide-*, bi-*, material-*)
  priority: number;     // Order in menu (0-100, lower = higher)
  groupConfig?: {       // Optional: group menu items
    id: string;
    title: string;      // i18n key
  }
}
```

### Optional Fields

- **`permissions`** - Array of permission keys (e.g., `["offers:manage"]`)
- **`url`** - Route URL (e.g., "/offers")
- **`name`** - Component name for routing

## ❌ Wrong Pattern

### Don't Use bootstrap.ts for Menu Items

```typescript
// ❌ WRONG: DO NOT add menu items in bootstrap.ts!
// File: src/bootstrap.ts
import { addMenuItem } from "@vc-shell/framework";

export function bootstrap(app: App) {
  // ❌ DO NOT DO THIS!
  addMenuItem({
    title: "Offers",
    icon: "fas fa-tags",
    priority: 10,
    url: "/offers",
  });
}
```

## Why defineOptions?

Framework automatically:
- ✅ Registers menu items from workspace blades
- ✅ Integrates with permissions system
- ✅ Handles navigation correctly
- ✅ Keeps configuration co-located with blade

## Example with Groups

```vue
<script setup lang="ts">
defineOptions({
  name: "ProductsList",
  url: "/products",
  isWorkspace: true,
  menuItem: {
    title: "PRODUCTS.MENU.TITLE",
    icon: "fas fa-box",
    priority: 20,
    // Group under "Catalog"
    groupConfig: {
      id: "catalog",
      title: "COMMON.GROUPS.CATALOG"
    }
  },
  permissions: ["catalog:products:read"],
});
</script>
```

## Multiple Modules

Each module has its own workspace blade:

```
src/modules/
├── offers/
│   └── pages/
│       └── offers-list.vue     ← isWorkspace: true, menuItem: {...}
├── products/
│   └── pages/
│       └── products-list.vue   ← isWorkspace: true, menuItem: {...}
└── customers/
    └── pages/
        └── customers-list.vue  ← isWorkspace: true, menuItem: {...}
```

Result in menu:
```
Sidebar Menu:
├── Dashboard
├── Offers        ← From offers-list.vue
├── Products      ← From products-list.vue
└── Customers     ← From customers-list.vue
```

## See Also

- [Module Registration Pattern](module-registration.md) - Automatic module registration
- [Dashboard Widget Registration](widget-registration.md) - When to use bootstrap.ts
