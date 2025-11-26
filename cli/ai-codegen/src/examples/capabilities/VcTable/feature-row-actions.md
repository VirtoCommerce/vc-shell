---
id: vctable-feature-row-actions
component: VcTable
type: USAGE
complexity: SIMPLE
category: component
tags: [usage]
title: "VcTable - feature-row-actions"
description: "Usage example for VcTable"
---

# Capability: Row Actions

## Type
FEATURE

## Description
Contextual actions for each table row

## When to Use
- Edit
- Delete
- Conditional actions

## Required Props/Slots/Events
**Props:**
- `item-action-builder`
- `enable-item-actions`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
MEDIUM

## Complete Working Example
```vue
<template>
  <VcTable
    :columns="columns"
    :items="products"
    multiselect
    select-all
    :item-action-builder="actionBuilder"
    enable-item-actions
    state-key="products-table"
    @selection-changed="onSelectionChanged"
  >
    <template #item_status="{ item }">
      <VcBadge :variant="item.isActive ? 'success' : 'danger'">
        {{ item.isActive ? 'Active' : 'Inactive' }}
      </VcBadge>
    </template>
  </VcTable>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { VcTable, VcBadge, ITableColumns, IActionBuilderResult } from '@vc-shell/framework';

const columns = ref<ITableColumns[]>([
  { id: 'name', title: 'Product Name', sortable: true, alwaysVisible: true },
  { id: 'sku', title: 'SKU', sortable: true, width: "120px" },
  { id: 'price', title: 'Price', sortable: true, width: "100px", type: 'money' },
  { id: 'status', title: 'Status', sortable: true, width: "120px" }
]);

const products = ref([
  { id: '1', name: 'Product A', sku: 'SKU001', price: 29.99, isActive: true },
  { id: '2', name: 'Product B', sku: 'SKU002', price: 49.99, isActive: true },
  { id: '3', name: 'Product C', sku: 'SKU003', price: 19.99, isActive: false }
]);

const selectedProducts = ref([]);

function actionBuilder(item) {
  return [
    {
      title: 'Edit',
      icon: 'material-edit',
      clickHandler: () => editProduct(item)
    },
    {
      title: 'Delete',
      icon: 'material-delete',
      type: 'danger',
      clickHandler: () => deleteProduct(item)
    }
  ];
}

function onSelectionChanged(items) {
  selectedProducts.value = items;
}

function editProduct(product) {
  // Edit logic
}

function deleteProduct(product) {
  // Delete logic
}
</script>
```

## Best Practices
- Use this capability when you need Edit
- Ensure proper error handling
- Follow VC-Shell naming conventions
