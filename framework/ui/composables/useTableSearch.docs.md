---
title: useTableSearch
category: composables
group: data
---

# useTableSearch

Manages page-level search state for `VcDataTable`. Returns a `searchValue` ref for `v-model:search-value` binding. When `stateKey` is provided, the keyword is restored from the blade URL on creation and persisted to the URL on change.

## When to Use

- You are using `VcDataTable` with `v-model:search-value`
- You want to share the search keyword with `useDataTableSort` and `useDataTablePagination` under the same `stateKey`
- You want URL-persistent search without wiring blade query params manually

## When NOT to Use

- The table filters client-side only and you do not need external search state
- You are using a custom search input unrelated to `VcDataTable`

## Basic Usage

```typescript
import { useTableSearch } from "@vc-shell/framework";

const { searchValue } = useTableSearch({
  stateKey: "offers_list",
  initial: "",
});
```

```vue
<VcDataTable v-model:search-value="searchValue" :items="items" />
```

## API

### Parameters (Options)

| Option     | Type                  | Default     | Description                                                                              |
| ---------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `stateKey` | `string \| undefined` | `undefined` | When set, restores and persists the search keyword to the blade URL query under this key |
| `initial`  | `string \| undefined` | `undefined` | Initial search value used when no URL state is present                                   |

### Returns

| Property      | Type          | Description                                              |
| ------------- | ------------- | -------------------------------------------------------- |
| `searchValue` | `Ref<string>` | Current search keyword; bind with `v-model:search-value` |

## Details

- With `stateKey`, the composable reads the current URL query on creation and sets `searchValue` from it. Each write to `searchValue` updates the URL query (using `router.replace`, no history entry added). The URL key used is `<stateKey>_search`.
- Without `stateKey`, `searchValue` is a plain `ref` with no URL interaction.
- Use the same `stateKey` value for `useDataTableSort`, `useDataTablePagination`, and `useTableSearch` on the same list page so all three share a consistent URL namespace.

## Tips

- Reset `searchValue` to `""` alongside `pagination.reset()` when clearing filters so the URL stays clean.
- The composable does not trigger data loads on its own. Watch `searchValue` or combine it in a unified `watch` with `sortExpression` and `pagination.currentPage`.

## Recipe: List Blade with URL State

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useDataTableSort, useDataTablePagination, useTableSearch } from "@vc-shell/framework";

const STATE_KEY = "offers_list";

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  stateKey: STATE_KEY,
  initialField: "createdDate",
  initialDirection: "DESC",
});

const { searchValue } = useTableSearch({ stateKey: STATE_KEY });

const searchResult = ref<{ results: Offer[]; totalCount: number }>();
const totalCount = computed(() => searchResult.value?.totalCount ?? 0);

const pagination = useDataTablePagination({
  stateKey: STATE_KEY,
  pageSize: 20,
  totalCount,
});

async function load() {
  searchResult.value = await api.searchOffers({
    sort: sortExpression.value,
    keyword: searchValue.value,
    skip: pagination.skip,
    take: pagination.pageSize,
  });
}

onMounted(() => load());
watch(sortExpression, () => load());
</script>

<template>
  <VcDataTable
    :items="searchResult?.results ?? []"
    :total-count="pagination.totalCount"
    :pagination="pagination"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:search-value="searchValue"
    @pagination-click="pagination.goToPage"
  >
    <VcColumn
      id="name"
      header="Name"
      sortable
    />
    <VcColumn
      id="createdDate"
      header="Created"
      sortable
    />
  </VcDataTable>
</template>
```

## Related

- [`useDataTableSort`](./useDataTableSort.docs.md) -- sort state composable for VcDataTable
- [`useDataTablePagination`](./useDataTablePagination.docs.md) -- pagination state composable for VcDataTable
- `VcDataTable` -- table component that accepts `v-model:search-value`
