---
id: useTableSort-basic-usage
type: FRAMEWORK_API  
category: composable
tags: [composable, table, sorting, list]
complexity: SIMPLE
title: "useTableSort - Basic Table Sorting"
description: "Managing table sorting state with direction toggle"
---

# useTableSort - Basic Table Sorting

Manage table sorting with reactive sort expression and automatic ASC ↔ DESC toggle.

## Basic Usage

```typescript
import { useTableSort } from '@vc-shell/framework';

const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

watch(sortExpression, async (value) => {
  await loadData({ sort: value });
});
```

## Complete Example (from vendor-portal offers-list.vue)

```vue
<template>
  <VcBlade>
    <VcTable
      :items="items"
      :columns="columns"
      :sort="sortExpression"
      @header-click="onHeaderClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useTableSort } from '@vc-shell/framework';
import { useOffersList } from '../composables';

const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

const { items, loadOffers, searchQuery } = useOffersList();

// Watch for sort changes and reload data
watch(sortExpression, async (value) => {
  await loadOffers({ ...searchQuery.value, sort: value });
});

// Handle header click from VcTable
function onHeaderClick(column: ITableColumns) {
  if (column.sortable) {
    handleSortChange(column.id);
  }
}

// Define sortable columns
const columns = computed(() => [
  { id: 'name', title: 'Name', sortable: true },
  { id: 'createdDate', title: 'Created', sortable: true, type: 'date-ago' },
  { id: 'isActive', title: 'Active', width: '100px' },
]);
</script>
```

## API Reference

```typescript
interface UseTableSortOptions {
  initialProperty?: string;
  initialDirection?: 'ASC' | 'DESC';
}

interface UseTableSortReturn {
  sortExpression: Ref<string | undefined>;  // "property:ASC" format
  currentSort: WritableComputedRef<TableSortState>;
  handleSortChange: (sortParam: string | ITableColumns) => void;
  resetSort: () => void;
}
```

## Sort Expression Format

- `"name:ASC"` - Sort by name ascending
- `"createdDate:DESC"` - Sort by createdDate descending
- `undefined` - No sorting

## Toggle Behavior

Clicking same column toggles direction:
1. First click: `"name:ASC"`
2. Second click: `"name:DESC"`
3. Third click: `undefined` (no sort)

Click different column: Resets to ASC.
