---
id: framework-useLoading
type: API
complexity: SIMPLE
category: framework
tags: [composable, framework, loading, async]
critical: true
title: "useLoading"
description: "Combine multiple loading states into single reactive boolean"
---

# useLoading - Combine Loading States

**Capability:** `combine-loading-states`
**When to use:** Track multiple async operations with single loading indicator
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`

---

## Description

Combines multiple boolean refs into a single computed ref that is `true` when ANY of the input states is `true`. Essential for showing loading indicators during multiple concurrent operations.

---

## Required Imports

```typescript
import { useLoading } from "@vc-shell/framework";
```

---

## Basic Usage

```typescript
import { ref } from "vue";
import { useLoading } from "@vc-shell/framework";

// Individual loading states
const loadingData = ref(false);
const savingData = ref(false);
const deletingData = ref(false);

// Combined - true if ANY is loading
const isLoading = useLoading(loadingData, savingData, deletingData);
```

---

## Complete Example (from vendor-portal)

### In Details Blade

```vue
<template>
  <VcBlade
    v-loading="allLoading"
    :title="title"
    :toolbar-items="bladeToolbar"
  >
    <!-- Blade content -->
  </VcBlade>
</template>

<script setup lang="ts">
import { useLoading } from "@vc-shell/framework";
import { useOffer } from "../composables";
import { useMarketplaceSettings } from "../../settings";
import { useMultilanguage } from "../../common";

// Multiple composables with their own loading states
const { loading } = useOffer();
const { loading: settingsLoading } = useMarketplaceSettings();
const { loading: loadingLanguages } = useMultilanguage();

// Local loading state
const productLoading = ref(false);

// Combine ALL loading states for v-loading directive
const allLoading = useLoading(
  loading,
  loadingLanguages,
  productLoading,
  settingsLoading
);
</script>
```

### In Composable

```typescript
// src/modules/orders/composables/useOrderDetails.ts
import { useAsync, useLoading } from "@vc-shell/framework";

export function useOrderDetails() {
  const { loading: loadingOrder, action: loadOrder } = useAsync(/* ... */);
  const { loading: savingOrder, action: saveOrder } = useAsync(/* ... */);
  const { loading: pdfLoading, action: generatePdf } = useAsync(/* ... */);

  // Export combined loading state
  return {
    loadOrder,
    saveOrder,
    generatePdf,
    // Single loading ref for consumers
    loading: useLoading(loadingOrder, savingOrder, pdfLoading),
  };
}
```

---

## API Reference

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `...args` | `Readonly<Ref<boolean>>[]` | Any number of boolean refs |

### Returns

| Type | Description |
|------|-------------|
| `ComputedRef<boolean>` | `true` if ANY input is `true` |

---

## Key Points

1. **Use with v-loading directive** - `<VcBlade v-loading="allLoading">`
2. **Accepts any number of refs** - Combine 2, 5, or 10 loading states
3. **Works with useAsync** - Combine loading states from multiple async operations
4. **Reactive** - Automatically updates when any input changes
5. **Export from composables** - Expose single `loading` ref to consumers

---

## Common Patterns

### Pattern 1: Blade with Multiple Data Sources

```typescript
const allLoading = useLoading(
  itemLoading,      // Main item
  settingsLoading,  // App settings
  optionsLoading,   // Dropdown options
);
```

### Pattern 2: CRUD Operations

```typescript
const loading = useLoading(
  loadingItem,
  creatingItem,
  updatingItem,
  deletingItem,
);
```

### Pattern 3: Composable Export

```typescript
export function useEntity() {
  const { loading: l1, action: load } = useAsync(loadFn);
  const { loading: l2, action: save } = useAsync(saveFn);

  return {
    load,
    save,
    loading: useLoading(l1, l2), // Export combined
  };
}
```
