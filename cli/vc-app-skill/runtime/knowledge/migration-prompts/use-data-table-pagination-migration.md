# useDataTablePagination Migration

Replace the manual `totalCount` / `pages` / `currentPage` computed triple plus hand-written `onPaginationClick` handler with a single `useDataTablePagination()` call.

## Rule 1: Update the data composable

For each list composable file:

### 1a. Add import

Add to the `@vc-shell/framework` import (merge, don't duplicate):

```ts
import { useDataTablePagination, type UseDataTablePaginationReturn } from "@vc-shell/framework";
```

### 1b. Create `pagination` before the return

Declare, before the return block:

```ts
const pagination = useDataTablePagination({
  pageSize,
  totalCount: computed(() => searchResult.value?.totalCount ?? 0),
  onPageChange: ({ skip }) => loadItems({ ...searchQuery.value, skip }),
});
```

- Use the same `pageSize` the composable already accepts as option (default 20).
- Pass `totalCount` as a computed (not a plain number).
- Use the composable's own loader name for `onPageChange` (`loadItems`, `loadMessages`, `searchXxx` — whatever already exists).

### 1c. Replace the three computed in the return

**Before:**
```ts
return {
  totalCount: computed(() => searchResult.value?.totalCount || 0),
  pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
  currentPage: computed(() => Math.ceil((searchQuery.value?.skip || 0) / pageSize + 1)),
  // ...other returns
};
```

**After:**
```ts
return {
  pagination,
  // ...other returns (unchanged)
};
```

### 1d. Update the return type interface (if present)

**Before:**
```ts
export interface IUseList {
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  // ...
}
```

**After:**
```ts
export interface IUseList {
  pagination: UseDataTablePaginationReturn;
  // ...
}
```

## Rule 2: Update the blade page template

### 2a. Replace VcDataTable pagination bindings

**Before:**
```vue
<VcDataTable
  :total-count="totalCount"
  :pagination="{ currentPage, pages }"
  @pagination-click="onPaginationClick"
/>
```

**After:**
```vue
<VcDataTable
  :total-count="pagination.totalCount"
  :pagination="pagination"
  @pagination-click="pagination.goToPage"
/>
```

### 2b. Update the composable destructure

**Before:**
```ts
const { items, totalCount, pages, currentPage, searchQuery, loadItems } = useList();
```

**After:**
```ts
const { items, pagination, searchQuery, loadItems } = useList();
```

### 2c. Delete the manual `onPaginationClick` handler

Remove the entire function — it's redundant; `pagination.goToPage` fires the composable's `onPageChange`.

**Delete:**
```ts
async function onPaginationClick(page: number) {
  await loadItems({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
}
```

### 2d. Rewrite `reload()` helper (if present)

If the blade has a `reload()` helper that recomputes skip from currentPage, use `pagination.skip`:

**Before:**
```ts
const reload = async () => {
  await loadItems({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sortExpression.value,
  });
};
```

**After:**
```ts
const reload = async () => {
  await loadItems({
    ...searchQuery.value,
    skip: pagination.skip,
    sort: sortExpression.value,
  });
};
```

## Rule 3: VcTable / VcTableAdapter — skip that file (not the whole topic)

Per-file check. If a specific blade page still uses `<VcTable>` (legacy adapter, with `:pages` + `:current-page` scalar props), SKIP that file — migrating pagination against a different table API would break the bindings. But:

- **Still migrate the composable** if other callers (pages with `<VcDataTable>`) exist — the composable change is independent of any single consumer.
- **Still migrate other pages** in the same `affectedFiles` list that DO use `<VcDataTable>`.
- In your report, mark the skipped file(s) as `needs vctable-audit first` so the user knows why.

Do not skip the entire topic just because one file is out of scope.

## Rule 4: Infinite-scroll tables — skip that file

If a specific VcDataTable uses `:infinite-scroll="true"`, pagination is not used — skip that file. Same per-file rule as Rule 3.

## Behavioral notes

- `pagination` is a `reactive()` object — access properties directly (`pagination.totalCount`), never `.value`.
- Do NOT destructure `pagination` — destructuring loses reactivity.
- `pagination.reset()` sets currentPage to 1 silently (no onPageChange fire). Use when resetting filters.

## Self-check after migration

- [ ] `totalCount`, `pages`, `currentPage` no longer appear in the composable's return.
- [ ] `onPaginationClick` function is deleted from the blade page.
- [ ] Template uses `pagination.goToPage` not a handwritten callback.
- [ ] No `.value` access on `pagination.*` properties.
- [ ] `useDataTablePagination` import is present in the composable.
