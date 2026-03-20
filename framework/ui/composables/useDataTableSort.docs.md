# useDataTableSort

Manages page-level sort state for `VcDataTable` using numeric sort order conventions (`1` = ASC, `-1` = DESC, `0` = none). Provides `sortField` and `sortOrder` refs for `v-model` binding directly on `VcDataTable`, plus a `sortExpression` computed string for API calls.

Use this composable when working with `VcDataTable` directly. For legacy `VcTable` (or `VcTableAdapter`) with `@header-click`, use [`useTableSort`](./useTableSort.docs.md) instead.

The sort expression is formatted as `"field:DIRECTION"` (e.g., `"createdDate:DESC"`), which is the standard format expected by VirtoCommerce Platform API endpoints.

## When to Use

- You are using `VcDataTable` with `v-model:sort-field` / `v-model:sort-order`
- You need to pass a `sortExpression` string to an API query
- You want to eliminate the three-ref boilerplate (`sortField`, `sortOrder`, `sortExpression`) from list blade pages
- You need a `resetSort()` helper (e.g., when search filters are cleared)

## When NOT to Use

- You are using `VcTable` / `VcTableAdapter` with `@header-click` — use `useTableSort` instead
- The table handles sorting internally and you do not need external sort state

## Basic Usage

```typescript
import { useDataTableSort } from '@vc-shell/framework';

const { sortField, sortOrder, sortExpression, resetSort } = useDataTableSort({
  initialField: 'createdDate',
  initialDirection: 'DESC',
});
```

```vue
<VcDataTable
  v-model:sort-field="sortField"
  v-model:sort-order="sortOrder"
  :items="items"
>
  <VcColumn id="name" header="Name" sortable />
  <VcColumn id="createdDate" header="Created" sortable />
</VcDataTable>
```

## API

### Parameters (Options)

| Option | Type | Default | Description |
|---|---|---|---|
| `initialField` | `string` | `undefined` | Column field to sort by initially |
| `initialDirection` | `"ASC" \| "DESC"` | `undefined` | Initial sort direction |

### Returns

| Property | Type | Description |
|---|---|---|
| `sortField` | `Ref<string \| undefined>` | Current sort field; bind with `v-model:sort-field` |
| `sortOrder` | `Ref<number>` | Numeric sort order: `1` = ASC, `-1` = DESC, `0` = none; bind with `v-model:sort-order` |
| `sortExpression` | `ComputedRef<string \| undefined>` | Formatted string (e.g., `"name:ASC"`) or `undefined` when no sort is active |
| `resetSort` | `() => void` | Reset to the initial field/direction passed to the composable |

## Direction Mapping

| `sortOrder` value | Direction | `sortExpression` |
|---|---|---|
| `1` | ASC | `"field:ASC"` |
| `-1` | DESC | `"field:DESC"` |
| `0` | none | `undefined` |

When `sortOrder` is `0`, `sortExpression` returns `undefined` regardless of `sortField`.

## Recipe: Server-Side Sorted Table

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { useDataTableSort } from "@vc-shell/framework";

const { sortField, sortOrder, sortExpression, resetSort } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

const items = ref([]);
const loading = ref(false);

async function loadItems() {
  loading.value = true;
  try {
    const response = await api.searchProducts({
      sort: sortExpression.value,  // e.g. "createdDate:DESC" or undefined
      skip: 0,
      take: 20,
    });
    items.value = response.results;
  } finally {
    loading.value = false;
  }
}

// Reload whenever sort changes; { immediate: true } loads data on mount
watch(sortExpression, () => loadItems(), { immediate: true });
</script>

<template>
  <VcDataTable
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    :items="items"
    :loading="loading"
  >
    <VcColumn id="name" header="Name" sortable />
    <VcColumn id="createdDate" header="Created" sortable />
    <VcColumn id="price" header="Price" sortable />
  </VcDataTable>
</template>
```

## Details

- **Sort expression format**: `sortExpression` returns `"field:DIRECTION"` when both `sortField` and a non-zero `sortOrder` are set, otherwise `undefined`. This format is directly compatible with VirtoCommerce Platform search endpoints.
- **Reset behavior**: `resetSort()` restores `sortField` and `sortOrder` to the values passed at construction time. If no initial options were provided, both are cleared.
- **Numeric order convention**: `VcDataTable` uses PrimeVue's numeric sort order convention (`1`/`-1`/`0`). This composable encapsulates the mapping so call sites never need to handle the numeric values directly.
- **Stateless regarding data**: The composable only manages the sort field and direction. Combine it with your own data-fetching logic using `watch(sortExpression, ...)`.

## Tips

- Always mark columns as `sortable` in your `<VcColumn>` definitions for the sort indicator icon to appear.
- Use `{ immediate: true }` on the `watch(sortExpression, ...)` call to trigger the initial data load with the correct sort on mount.
- Call `resetSort()` alongside any "clear all filters" action to keep sort state consistent with the rest of the filter UI.

## Related

- [`useTableSort`](./useTableSort.docs.md) — equivalent composable for legacy `VcTable` / `VcTableAdapter` with `@header-click`
- `VcDataTable` — table component that accepts `v-model:sort-field` / `v-model:sort-order`
- `VcTableAdapter` — backward-compatible wrapper; use `useTableSort` with this component
