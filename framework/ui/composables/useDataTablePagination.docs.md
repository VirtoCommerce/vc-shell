# useDataTablePagination

Manages page-level pagination state for `VcDataTable`. Derives `pages`, `skip`, and a ready-made `paginationProps` object from a reactive `totalCount` input, and fires an optional `onPageChange` callback when the page changes.

Follows the same event-callback pattern as VueUse's `useOffsetPagination`.

## When to Use

- You are using `VcDataTable` with `:pagination` prop and `@pagination-click` event
- You want to eliminate the `Math.ceil` / `Math.floor` pagination boilerplate from data composables
- You want a ready-made `paginationProps` object instead of manually constructing `{ currentPage, pages }`

## When NOT to Use

- You are using infinite scroll (`infiniteScroll` prop) — no pagination needed
- The table is client-side only with all items loaded — VcDataTable handles display internally

## Basic Usage

```typescript
import { useDataTablePagination } from '@vc-shell/framework';

const pagination = useDataTablePagination({
  pageSize: 20,
  totalCount: computed(() => searchResult.value?.totalCount ?? 0),
  onPageChange: ({ skip }) => loadItems({ ...searchQuery.value, skip }),
});
```

```vue
<VcDataTable
  :items="items"
  :total-count="totalCount"
  :pagination="pagination.paginationProps"
  @pagination-click="pagination.goToPage"
/>
```

## API

### Parameters (Options)

| Option | Type | Default | Description |
|---|---|---|---|
| `totalCount` | `MaybeRefOrGetter<number>` | *required* | Total item count from API response |
| `pageSize` | `MaybeRefOrGetter<number>` | `20` | Items per page |
| `onPageChange` | `(state: { page: number; skip: number }) => void` | `undefined` | Event callback fired when `goToPage()` is called |

### Returns

| Property | Type | Description |
|---|---|---|
| `currentPage` | `Ref<number>` | Current 1-based page number |
| `pages` | `ComputedRef<number>` | Total number of pages |
| `skip` | `ComputedRef<number>` | Current skip offset for API calls |
| `pageSize` | `ComputedRef<number>` | Resolved page size |
| `paginationProps` | `ComputedRef<DataTablePagination>` | Ready-made prop object for `:pagination` binding |
| `goToPage` | `(page: number) => void` | Navigate to page; fires `onPageChange` |
| `reset` | `() => void` | Reset to page 1; does NOT fire `onPageChange` |

## Recipe: Server-Side Paginated Table

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useDataTablePagination, useDataTableSort } from "@vc-shell/framework";

// Data layer
const searchResult = ref<{ results: Item[]; totalCount: number }>();
const searchQuery = ref({ take: 20, skip: 0 });

async function loadItems(query?: Partial<typeof searchQuery.value>) {
  searchQuery.value = { ...searchQuery.value, ...query };
  searchResult.value = await api.search(searchQuery.value);
}

// Pagination state
const pagination = useDataTablePagination({
  pageSize: 20,
  totalCount: computed(() => searchResult.value?.totalCount ?? 0),
  onPageChange: ({ skip }) => loadItems({ skip }),
});

// Sort state
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
</script>

<template>
  <VcDataTable
    :items="searchResult?.results ?? []"
    :total-count="searchResult?.totalCount"
    :pagination="pagination.paginationProps"
    @pagination-click="pagination.goToPage"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
  >
    <VcColumn id="name" header="Name" sortable />
    <VcColumn id="createdDate" header="Created" sortable />
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
    onPageChange: ({ skip }) => loadOffers({ ...searchQuery.value, skip }),
  });

  return {
    offers: computed(() => searchResult.value?.results ?? []),
    totalCount: computed(() => searchResult.value?.totalCount ?? 0),
    pagination,
    loadOffers,
  };
}
```

Blade then simply binds:

```vue
<VcDataTable
  :pagination="pagination.paginationProps"
  @pagination-click="pagination.goToPage"
/>
```

## Details

- **Event callback, not load**: `onPageChange` is an event notification (like VueUse's `useOffsetPagination`). The composable does not know about data fetching — it just notifies.
- **No auto-clamp**: When `totalCount` decreases (e.g. after deletion), `currentPage` is NOT automatically clamped. Call `reset()` or `goToPage(1)` explicitly after mutations.
- **reset() is silent**: `reset()` sets `currentPage = 1` but does NOT fire `onPageChange`. This prevents accidental double-fetches when the consumer resets pagination during a reload.
- **Pure without callback**: Omit `onPageChange` and the composable works as pure state — useful for unit tests or when the consumer prefers to watch `skip` reactively.

## Tips

- Call `pagination.reset()` alongside search/filter changes to return to page 1.
- Pair with `useDataTableSort` for the complete table state management story.
- The `skip` computed can be used directly in API queries when not using `onPageChange`.

## Related

- [`useDataTableSort`](./useDataTableSort.docs.md) — sort state composable for VcDataTable
- `VcDataTable` `:pagination` prop — accepts `DataTablePagination` object
- `DataTablePagination` type — defined in `vc-data-table/types.ts`
