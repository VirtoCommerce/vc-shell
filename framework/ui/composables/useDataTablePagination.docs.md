---
title: useDataTablePagination
category: composables
group: data
---

# useDataTablePagination

Manages page-level pagination state for `VcDataTable`. Derives `pages`, `skip`, `totalCount` from a reactive input, and fires an optional `onPageChange` callback when the page changes. Returns a `reactive()` object — all properties are plain values (no `.value` needed), and the object is directly passable as the VcDataTable `:pagination` prop.

Follows the same event-callback pattern as VueUse's `useOffsetPagination`.

## When to Use

- You are using `VcDataTable` with `:pagination` prop and `@pagination-click` event
- You want to eliminate the `Math.ceil` / `Math.floor` pagination boilerplate from data composables
- You want a single object to bind as `:pagination`, `:total-count`, and `@pagination-click`

## When NOT to Use

- You are using infinite scroll (`infiniteScroll` prop) — no pagination needed
- The table is client-side only with all items loaded — VcDataTable handles display internally

## Basic Usage

```typescript
import { useDataTablePagination } from "@vc-shell/framework";

const pagination = useDataTablePagination({
  pageSize: 20,
  totalCount: computed(() => searchResult.value?.totalCount ?? 0),
});
```

```vue
<VcDataTable :items="items" :total-count="pagination.totalCount" :pagination="pagination" @pagination-click="pagination.goToPage" />
```

> **Note:** Let `@pagination-click` only update the page (`goToPage`) and load from one watcher that reads `pagination.skip` together with sort and search — see the recipe below. `onPageChange` (load on each page change) still works for simple tables, but do not combine it with that watcher or the page loads twice.

## API

### Parameters (Options)

| Option         | Type                                              | Default     | Description                                      |
| -------------- | ------------------------------------------------- | ----------- | ------------------------------------------------ |
| `totalCount`   | `MaybeRefOrGetter<number>`                        | _required_  | Total item count from API response               |
| `pageSize`     | `MaybeRefOrGetter<number>`                        | `20`        | Items per page                                   |
| `onPageChange` | `(state: { page: number; skip: number }) => void` | `undefined` | Event callback fired when `goToPage()` is called |

### Returns (`reactive()` object)

| Property      | Type                     | Description                                                             |
| ------------- | ------------------------ | ----------------------------------------------------------------------- |
| `currentPage` | `number`                 | Current 1-based page number (writable)                                  |
| `pages`       | `number` (readonly)      | Total number of pages                                                   |
| `skip`        | `number` (readonly)      | Current skip offset for API calls                                       |
| `pageSize`    | `number` (readonly)      | Resolved page size                                                      |
| `totalCount`  | `number` (readonly)      | Resolved total item count                                               |
| `goToPage`    | `(page: number) => void` | Navigate to page; fires `onPageChange`                                  |
| `setPage`     | `(page: number) => void` | Seed the page WITHOUT firing `onPageChange` — use for pull-restore seed |
| `reset`       | `() => void`             | Reset to page 1; does NOT fire `onPageChange`                           |

All properties are auto-unwrapped by `reactive()` — no `.value` access needed in script or template.

## Recipe: Server-Side Paginated Table

```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDataTablePagination, useDataTableSort, useTableQueryState } from "@vc-shell/framework";

// Data layer
const searchResult = ref<{ results: Item[]; totalCount: number }>();

async function loadItems(query: { sort?: string; keyword?: string; skip?: number }) {
  searchResult.value = await api.search({ take: 20, ...query });
}

// State only — no self-loading callback.
const pagination = useDataTablePagination({
  pageSize: 20,
  totalCount: computed(() => searchResult.value?.totalCount ?? 0),
});
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
const searchValue = ref<string>();

// Restore from the URL, then load once. setPage seeds the page without loading.
const restored = useTableQueryState("product-list").read();
if (restored.sort) {
  const [field, dir] = restored.sort.split(":");
  sortField.value = field;
  sortOrder.value = dir === "DESC" ? -1 : 1;
}
if (restored.search) searchValue.value = restored.search;
if (restored.page) pagination.setPage(restored.page);

// One loader reading sort + search + page.
watch(
  () => ({ sort: sortExpression.value, keyword: searchValue.value || undefined, skip: pagination.skip }),
  (query) => loadItems(query),
  { immediate: true },
);
</script>

<template>
  <VcDataTable
    :items="searchResult?.results ?? []"
    :total-count="pagination.totalCount"
    :pagination="pagination"
    @pagination-click="pagination.goToPage"
    @search="
      (kw) => {
        searchValue = kw;
        pagination.setPage(1);
      }
    "
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
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

## Recipe: Inside a Data Composable

```typescript
// useOffers.ts
export function useOffers() {
  const searchResult = ref<SearchOffersResult>();
  const searchQuery = ref<SearchOffersQuery>({ take: 20 });

  const { action: loadOffers } = useAsync(async (query) => {
    searchQuery.value = { ...searchQuery.value, ...query };
    searchResult.value = await client.searchOffers(searchQuery.value);
  });

  const pagination = useDataTablePagination({
    pageSize: 20,
    totalCount: computed(() => searchResult.value?.totalCount ?? 0),
  });

  return {
    offers: computed(() => searchResult.value?.results ?? []),
    pagination,
    loadOffers,
  };
}
```

The blade owns the single loader watch (reading `pagination.skip` with sort/search) and binds:

```vue
<VcDataTable :total-count="pagination.totalCount" :pagination="pagination" @pagination-click="pagination.goToPage" />
```

## Details

- **`reactive()` return**: The composable wraps its return in `reactive()`, so all `Ref`/`ComputedRef` properties are auto-unwrapped. Access with `pagination.pages` (not `pagination.pages.value`). This allows the object to be passed directly as `:pagination` prop to VcDataTable without intermediate conversion.
- **Event callback, not load**: `onPageChange` is an event notification (like VueUse's `useOffsetPagination`). The composable does not fetch data. With a single loader watcher you usually omit it and read `pagination.skip` from the watcher instead.
- **`setPage` vs `goToPage`**: `goToPage(n)` updates the page and fires `onPageChange`; `setPage(n)` updates it without the callback. Use `setPage` to seed the page from a URL restore so the seed itself does not load.
- **No auto-clamp**: When `totalCount` decreases (e.g. after deletion), `currentPage` is NOT automatically clamped. Call `reset()` or `goToPage(1)` explicitly after mutations.
- **reset() is silent**: `reset()` sets `currentPage = 1` but does NOT fire `onPageChange`. This prevents accidental double-fetches when the consumer resets pagination during a reload.
- **Pure without callback**: Omit `onPageChange` and the composable works as pure state — useful for unit tests or when the consumer prefers to watch properties reactively.
- **Why `reactive()` and not `ref()`**: Pagination is a cohesive group of properties always used together (`pagination.xxx`). `reactive()` is the Vue-idiomatic choice for such objects. `useDataTableSort` returns `ref()`s because its properties are destructured and used with `v-model` individually.

## Tips

- Call `pagination.reset()` alongside search/filter changes to return to page 1.
- Pair with `useDataTableSort` for the complete table state management story.
- The `skip` property can be used directly in API queries when not using `onPageChange`.
- Do NOT destructure properties: `const { pages } = pagination` loses reactivity. Always access via `pagination.pages`.

## Related

- [`useDataTableSort`](./useDataTableSort.docs.md) -- sort state composable for VcDataTable
- `VcDataTable` `:pagination` prop -- accepts `DataTablePagination` object
- `DataTablePagination` -- type exported from `@vc-shell/framework`
