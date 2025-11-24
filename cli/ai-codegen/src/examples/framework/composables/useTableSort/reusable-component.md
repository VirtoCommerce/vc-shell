---
id: useTableSort-reusable-component
type: FRAMEWORK_API
category: composable
tags: [composable, table, sorting, reusable]
complexity: MODERATE
title: "useTableSort - Reusable Component Pattern"
description: "Creating reusable list components with built-in sorting"
---

# useTableSort - Reusable Component Pattern

Create reusable list components that handle sorting internally.

## Example (from vendor-portal ProductsListBase.vue)

```vue
<script setup lang="ts">
import { useTableSort } from '@vc-shell/framework';

interface Props {
  load: (params: any) => Promise<void>;
}

const props = defineProps<Props>();

const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

// Call parent's load function with sort
async function onHeaderClick(column: ITableColumns) {
  handleSortChange(column.id);
  await props.load({ sort: sortExpression.value });
}

// Load initial data with sort
onMounted(async () => {
  await props.load({ sort: sortExpression.value });
});
</script>
```

## Usage

```vue
<template>
  <ProductsListBase :load="loadProducts" />
</template>

<script setup>
const loadProducts = async (params) => {
  const data = await api.getProducts(params);
  items.value = data.items;
};
</script>
```

This pattern allows sorting logic to be encapsulated in the reusable component.
