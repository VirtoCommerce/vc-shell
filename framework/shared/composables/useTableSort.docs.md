# useTableSort

Manages table sort state with three-state cycling (ASC, DESC, none) and a formatted sort expression string. This composable externalizes the sort logic from VcDataTable, making it easy to drive server-side sorting, persist sort preferences, or share sort state across multiple components.

The sort expression is formatted as `"property:DIRECTION"` (e.g., `"createdDate:DESC"`), which is the standard format expected by VirtoCommerce Platform API endpoints.

## When to Use

- Control table sorting externally (e.g., pass `sortExpression` to an API query)
- Need to persist or share sort state across components
- Implement server-side sorting where the API handles data ordering
- When NOT to use: if VcTable's internal sort handling is sufficient and you do not need external sort state

## Basic Usage

```typescript
import { useTableSort } from '@vc-shell/framework';

const { sortExpression, handleSortChange, resetSort } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

// Wire to VcTable
// <VcTable :sort-expression="sortExpression" @header-click="handleSortChange" />

// Use in API calls
watch(sortExpression, (sort) => {
  loadItems({ sort }); // e.g., "createdDate:DESC"
});
```

## API

### Parameters (Options)

| Option | Type | Default | Description |
|---|---|---|---|
| `initialProperty` | `string` | `null` | Column property to sort by initially |
| `initialDirection` | `"ASC" \| "DESC"` | `null` | Initial sort direction |

### Returns

| Property | Type | Description |
|---|---|---|
| `currentSort` | `WritableComputedRef<TableSortState>` | Current `{ property, direction }` state |
| `sortExpression` | `Ref<string \| undefined>` | Formatted string (e.g., `"name:ASC"`) or `undefined` when no sort |
| `handleSortChange` | `(sortParam: string) => void` | Handle column header click; accepts `"field"` or `"field:DIR"` |
| `resetSort` | `() => void` | Reset to initial sort options (or clear if none) |

### TableSortState

```typescript
interface TableSortState {
  property: string | null;
  direction: "ASC" | "DESC" | null;
}
```

## Sort Cycling

When clicking the same column without an explicit direction:
1. First click: `ASC`
2. Second click: `DESC`
3. Third click: sort cleared (`undefined`)

When clicking a new column, defaults to `ASC`.

When the sort parameter includes an explicit direction (e.g., `"name:DESC"`), the direction is applied directly without cycling.

## Recipe: Server-Side Sorted Table with Loading State

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { useTableSort } from "@vc-shell/framework";

const { sortExpression, handleSortChange, resetSort } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});

const items = ref([]);
const loading = ref(false);

async function loadItems() {
  loading.value = true;
  try {
    const response = await api.searchProducts({
      sort: sortExpression.value,  // "createdDate:DESC"
      skip: 0,
      take: 20,
    });
    items.value = response.results;
  } finally {
    loading.value = false;
  }
}

// Reload when sort changes
watch(sortExpression, () => loadItems(), { immediate: true });
</script>

<template>
  <VcTable
    :items="items"
    :loading="loading"
    :sort-expression="sortExpression"
    @header-click="handleSortChange"
  >
    <VcColumn id="name" header="Name" sortable />
    <VcColumn id="createdDate" header="Created" sortable />
    <VcColumn id="price" header="Price" sortable />
  </VcTable>
</template>
```

## Details

- **Sort expression format**: The `sortExpression` computed returns `"property:DIRECTION"` when active, or `undefined` when no sort is applied. This format is directly compatible with VirtoCommerce Platform search endpoints.
- **Writable computed**: `currentSort` is a `WritableComputedRef`, so you can set it programmatically: `currentSort.value = { property: "name", direction: "ASC" }`.
- **Reset behavior**: `resetSort()` returns to the initial options passed to the composable. If no initial options were provided, it clears the sort entirely.
- **handleSortChange format**: Accepts either `"fieldName"` (triggers cycling) or `"fieldName:DIR"` (sets explicit direction). VcDataTable's `@header-click` event emits in the latter format when the adapter encodes direction.

## Tips

- Always mark columns as `sortable` in your VcColumn definitions for the sort indicator icon to appear.
- When implementing server-side sorting, use `watch(sortExpression, ...)` with `{ immediate: true }` to load data with the initial sort on mount.
- The composable is stateless regarding the table data itself -- it only manages the sort property and direction. Combine with your own data-fetching logic.

## Related

- `VcDataTable` -- emits header-click events consumed by `handleSortChange`
- `VcTableAdapter` -- adapts legacy sort prop format
- `useTableSelection` -- often used alongside sort for list blade patterns
