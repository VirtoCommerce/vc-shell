# 41. useDataTablePagination Composable

## What Changed

A new `useDataTablePagination` composable is available to replace the manual `totalCount` / `pages` / `currentPage` triple-computed boilerplate that list composables declare, together with the hand-written `onPaginationClick` handler that blade pages wire up for `@pagination-click`.

The composable returns a `reactive()` object that is **passable directly** as the VcDataTable `:pagination` prop, and exposes `goToPage` as a drop-in handler for the `@pagination-click` event.

**Before** (manual pagination boilerplate):

```typescript
// Data composable
export function useList(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<SearchCriteria>({ take: pageSize });
  const searchResult = ref<SearchResult>();

  const { action: loadItems, loading } = useAsync(async (_query) => {
    searchQuery.value = { ...searchQuery.value, ...(_query || {}) };
    const apiClient = await getApiClient();
    searchResult.value = await apiClient.search(searchQuery.value);
  });

  return {
    items: computed(() => searchResult.value?.results || []),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
    currentPage: computed(() => Math.ceil((searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1)),
    searchQuery: computed(() => searchQuery.value),
    loadItems,
    loading,
  };
}
```

```vue
<!-- Blade page -->
<template>
  <VcDataTable
    :items="items"
    :total-count="totalCount"
    :pagination="{ currentPage, pages }"
    @pagination-click="onPaginationClick"
  />
</template>

<script setup lang="ts">
const { items, totalCount, pages, currentPage, searchQuery, loadItems } = useList({
  pageSize: 20,
});

async function onPaginationClick(page: number) {
  await loadItems({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
}
</script>
```

**After** (using `useDataTablePagination`):

```typescript
// Data composable
import { useDataTablePagination, type UseDataTablePaginationReturn } from "@vc-shell/framework";

export interface IUseList {
  items: ComputedRef<Item[]>;
  pagination: UseDataTablePaginationReturn;
  searchQuery: Ref<SearchCriteria>;
  loadItems: (query?: SearchCriteria) => Promise<void>;
  loading: ComputedRef<boolean>;
}

export function useList(options?: { pageSize?: number }): IUseList {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<SearchCriteria>({ take: pageSize });
  const searchResult = ref<SearchResult>();

  const { action: loadItems, loading } = useAsync(async (_query) => {
    searchQuery.value = { ...searchQuery.value, ...(_query || {}) };
    const apiClient = await getApiClient();
    searchResult.value = await apiClient.search(searchQuery.value);
  });

  const pagination = useDataTablePagination({
    pageSize,
    totalCount: computed(() => searchResult.value?.totalCount ?? 0),
    onPageChange: ({ skip }) => loadItems({ ...searchQuery.value, skip }),
  });

  return {
    items: computed(() => searchResult.value?.results || []),
    pagination,
    searchQuery,
    loadItems,
    loading,
  };
}
```

```vue
<!-- Blade page -->
<template>
  <VcDataTable
    :items="items"
    :total-count="pagination.totalCount"
    :pagination="pagination"
    @pagination-click="pagination.goToPage"
  />
</template>

<script setup lang="ts">
const { items, pagination, searchQuery, loadItems } = useList({
  pageSize: 20,
});
// No manual onPaginationClick — pagination.goToPage handles it
</script>
```

## Migration Steps

### Step 1 — Update the data composable

Replace the `totalCount` / `pages` / `currentPage` computed triple with a single `useDataTablePagination()` call.

1. **Add the import:**

   ```typescript
   import { useDataTablePagination, type UseDataTablePaginationReturn } from "@vc-shell/framework";
   ```

2. **Replace the three computed properties** — remove `totalCount`, `pages`, and `currentPage` from the return block and declare a single `pagination` before the return:

   ```typescript
   // Remove:
   return {
     totalCount: computed(() => searchResult.value?.totalCount || 0),
     pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
     currentPage: computed(() => Math.ceil((searchQuery.value?.skip || 0) / pageSize + 1)),
     // ...
   };

   // Add (before the return):
   const pagination = useDataTablePagination({
     pageSize,
     totalCount: computed(() => searchResult.value?.totalCount ?? 0),
     onPageChange: ({ skip }) => loadItems({ ...searchQuery.value, skip }),
   });

   // Then return it:
   return {
     pagination,
     // ...
   };
   ```

3. **Update the return type interface** — replace the three `ComputedRef<number>` entries with a single `pagination: UseDataTablePaginationReturn`:

   ```typescript
   // Remove:
   export interface IUseList {
     totalCount: ComputedRef<number>;
     pages: ComputedRef<number>;
     currentPage: ComputedRef<number>;
     // ...
   }

   // Add:
   export interface IUseList {
     pagination: UseDataTablePaginationReturn;
     // ...
   }
   ```

### Step 2 — Update the blade page template

1. **Replace the `:pagination` binding and `:total-count` prop:**

   ```vue
   <!-- Remove: -->
   <VcDataTable
     :total-count="totalCount"
     :pagination="{ currentPage, pages }"
     @pagination-click="onPaginationClick"
   />

   <!-- Add: -->
   <VcDataTable
     :total-count="pagination.totalCount"
     :pagination="pagination"
     @pagination-click="pagination.goToPage"
   />
   ```

2. **Update the script destructure** — replace `totalCount`, `pages`, `currentPage` with the single `pagination`:

   ```typescript
   // Remove:
   const { items, totalCount, pages, currentPage, searchQuery, loadItems } = useList();

   // Add:
   const { items, pagination, searchQuery, loadItems } = useList();
   ```

3. **Remove the `onPaginationClick` handler entirely** — the composable's `onPageChange` callback now handles data fetching:

   ```typescript
   // Remove:
   async function onPaginationClick(page: number) {
     await loadItems({
       ...searchQuery.value,
       skip: (page - 1) * (searchQuery.value.take ?? 20),
     });
   }
   ```

4. **Update the `reload()` helper** — use `pagination.skip` instead of recomputing it from `currentPage`:

   ```typescript
   // Before:
   const reload = async () => {
     await loadItems({
       ...searchQuery.value,
       skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
       sort: sortExpression.value,
     });
   };

   // After:
   const reload = async () => {
     await loadItems({
       ...searchQuery.value,
       skip: pagination.skip,
       sort: sortExpression.value,
     });
   };
   ```

## Behavioral Notes

- **`reactive()` return, no `.value`**: The composable wraps its return in `reactive()`, so all properties are plain values. Access as `pagination.totalCount` / `pagination.skip`, never `pagination.totalCount.value`.
- **Event callback, not loader**: `onPageChange` is an event notification (like VueUse's `useOffsetPagination`). The composable itself does not know about data fetching — it just notifies the caller when `goToPage()` fires.
- **No auto-clamp after deletion**: When `totalCount` decreases (e.g., after removing items), `currentPage` is NOT automatically clamped to the new last page. Call `pagination.reset()` or `pagination.goToPage(1)` explicitly after mutations if needed.
- **`reset()` is silent**: `reset()` sets `currentPage = 1` but does NOT fire `onPageChange`. This prevents accidental double-fetches when the consumer resets pagination during a reload.
- **Do not destructure**: `const { pages } = pagination` loses reactivity. Always access via `pagination.xxx`.

## When NOT to Migrate

- **Infinite scroll tables** — if you are using `:infinite-scroll="true"` on VcDataTable, pagination is not used.
- **Client-side-only tables** — if the full dataset is loaded once and VcDataTable handles paging internally, no composable is needed.
- **Legacy `VcTable` / `VcTableAdapter` with `:pages` + `:current-page` props** — these accept separate scalars. `useDataTablePagination` targets `VcDataTable`'s `:pagination` object prop. If you are still on `VcTableAdapter`, migrate to `VcDataTable` first (see [guide 29](./29-vc-table-to-data-table.md)).

## How to Find

```bash
# Find composables that still compute pages manually
grep -rn 'Math\.ceil.*pageSize\|Math\.ceil.*totalCount' src/ --include="*.ts"

# Find blade pages with manual onPaginationClick handlers
grep -rn 'onPaginationClick\|@pagination-click' src/ --include="*.vue"

# Find composables returning the totalCount / pages / currentPage triple
grep -rln 'totalCount:.*computed\|pages:.*computed\|currentPage:.*computed' src/ --include="*.ts"
```

## Related

- [Guide 29 — VcTable → VcDataTable](./29-vc-table-to-data-table.md) — migrate the table component first if still on `VcTableAdapter`
- [Guide 31 — useDataTableSort](./31-use-data-table-sort.md) — companion composable for sort state; pair both for complete list-blade state management
- `useDataTablePagination` docs — see [`useDataTablePagination.docs.md`](../framework/ui/composables/useDataTablePagination.docs.md) for the full API reference
