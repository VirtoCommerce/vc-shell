---
name: table-url-state-migration
description: AI transformation rules for opting an existing VcDataTable list into URL-query state persistence (sort, search, page) via the composables' stateKey option.
---

# Table URL State: persist sort / search / page in the blade URL

This retrofit applies to list blades that **already use `VcDataTable`** with the state
composables (`useDataTableSort`, `useDataTablePagination`, and search) but do **not** yet
persist the view to the URL. After it, sort, search keyword, and current page survive a
reload and travel in a shareable link.

It is independent of the VcTable→VcDataTable swap (`datatable-migration`) and of adopting
the pagination composable (`use-data-table-pagination-migration`). Run those first if the
file still uses `<VcTable>` or hand-rolled `pages`/`currentPage`.

## Concept

Each state composable accepts an optional `stateKey`. With it set, the composable reads its
initial value from the blade URL query on creation and writes changes back:

- `useDataTableSort({ stateKey })` → `<stateKey>_sort` (e.g. `createdDate:DESC`)
- `useTableSearch({ stateKey })` → `<stateKey>_search`
- `useDataTablePagination({ stateKey })` → `<stateKey>_page` (page 1 is encoded as absent)

The `state-key` **prop** on `<VcDataTable>` is unrelated — it persists column layout to
`localStorage`. Leave it as-is. The composable `stateKey` is the URL query store.

## Choosing the key

- One key per table, **the same string** across all three composables on that blade.
- Use snake_case, conventionally `<module>_list` (e.g. `orders_list`). It may equal the
  table `state-key` prop — they are separate stores.
- The key must be unique among tables that can be visible simultaneously (a list plus a
  child list in the same stack), so their query params do not collide.

## Precondition: the blade must be URL-addressable

`stateKey` only does something when the blade has a `url` in `defineBlade`. For a
non-routable or nested blade (no `url`) the query service is a no-op — skip that file and
note it in the report rather than adding dead options.

## RULE 1: Add `stateKey` to `useDataTableSort`

**BEFORE:**

```ts
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
```

**AFTER:**

```ts
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  stateKey: "orders_list",
  initialField: "createdDate",
  initialDirection: "DESC",
});
```

## RULE 2: Own the search keyword with `useTableSearch({ stateKey })`

The keyword must live in a ref that `useTableSearch` controls, bound to
`v-model:search-value`. Three starting shapes:

**2a — bare `ref("")` in the blade:** replace it.

```ts
// BEFORE
const searchValue = ref("");
// AFTER
const { searchValue } = useTableSearch({ stateKey: "orders_list" });
```

**2b — event-driven `@search` with no ref:** the table emits `@search` and a handler loads
directly. Convert to `v-model:search-value` + a watcher.

```vue
<!-- BEFORE -->
<VcDataTable :searchable="true" @search="onSearchChange" />
<!-- AFTER -->
<VcDataTable :searchable="true" v-model:search-value="searchValue" />
```

```ts
// BEFORE
async function onSearchChange(keyword: string | undefined) {
  await loadItems({ ...searchQuery.value, keyword, skip: 0 });
}
// AFTER — remove onSearchChange; drive load from the watcher (see RULE 5)
const { searchValue } = useTableSearch({ stateKey: "orders_list" });
```

**2c — the deprecated `useTableQueryState().read()` preview form:** delete the manual
restore block entirely (see RULE 6); the three composables now seed themselves.

In all cases add `v-model:search-value="searchValue"` to the `<VcDataTable>` and keep
`:searchable="true"`.

## RULE 3: Add `stateKey` to `useDataTablePagination`

If pagination is created in the blade, add the option directly:

```ts
const pagination = useDataTablePagination({
  stateKey: "orders_list",
  pageSize: 20,
  totalCount,
});
```

If pagination is created **inside the list composable** (common when `onPageChange` drives
the load), thread `stateKey` through as a composable option — the blade still owns the key:

```ts
// composable
export function useOrdersList(options?: { pageSize?: number; stateKey?: string }) {
  // ...
  const pagination = useDataTablePagination({
    stateKey: options?.stateKey,
    pageSize: options?.pageSize ?? 20,
    totalCount: computed(() => searchResult.value?.totalCount ?? 0),
    onPageChange: ({ skip }) => loadItems({ ...searchQuery.value, skip }),
  });
}
```

```ts
// blade
const { items, pagination, loadItems } = useOrdersList({ stateKey: "orders_list" });
```

Add the `stateKey?: string` field to the composable's options interface.

## RULE 4: Seed the initial load from the restored values

The first load on mount must read the restored sort, keyword, and page — otherwise the URL
is restored into the refs but the first fetch ignores them and shows page 1 unfiltered.

```ts
// BEFORE
onMounted(() => loadItems({ take: 20, sort: sortExpression.value }));
// AFTER
onMounted(() =>
  loadItems({
    take: 20,
    sort: sortExpression.value,
    keyword: searchValue.value || undefined,
    skip: pagination.skip,
  }),
);
```

For a `reload()` helper, use `skip: pagination.skip` (not a recomputed skip).

## RULE 5: Reset to page 1 when the search changes — REQUIRED

This is not optional. If the user is on page 3 and types a query that returns fewer pages,
leaving `_page=3` in the URL makes the next reload request page 3 of the filtered set:
`skip` overshoots and the table shows an empty "nothing found" state on reload. Resetting to
page 1 drops `_page` from the URL and keeps the `(search, page)` pair consistent.

```ts
watch(searchValue, () => pagination.setPage(1));
// then the reload watcher (debounced) picks up the change:
watch([sortExpression, searchValue, () => pagination.skip], debounce(load, 300));
```

If search loads through a separate handler (event-driven apps), call `pagination.setPage(1)`
at the top of that handler before loading with `skip: 0`. Apply the same reset when a global
filter changes.

## RULE 6: Remove the deprecated preview API

Delete any `useTableQueryState().read()` or `useTableQueryPersistence` usage and the manual
ref-seeding it drove — the `stateKey` option replaces it.

```ts
// DELETE this whole block:
const restored = useTableQueryState("orders_list").read();
if (restored.sort) {
  /* ... */
}
if (restored.search) searchValue.value = restored.search;
if (restored.page) pagination.setPage(restored.page);
```

Remove the now-unused `useTableQueryState` / `useTableQueryPersistence` import.

## Advanced: a shared list base with two views

Some apps render two datasets (e.g. flat list vs. category tree) through one
`VcDataTable`-wrapping base component, each with its own `useDataTablePagination`. Pass the
same `stateKey` to **both** view paginations (only one view is active at a time, so they
never write the page param simultaneously) and reset the page on search via the unified
pagination object the base holds (`props.pagination.setPage(1)`).

## What to add

- `stateKey` on `useDataTableSort`, `useDataTablePagination`, and `useTableSearch` (same key)
- `useTableSearch({ stateKey })` import + `v-model:search-value="searchValue"` binding
- `watch(searchValue, () => pagination.setPage(1))`
- `skip: pagination.skip` and `keyword: searchValue.value || undefined` in the initial load
- `stateKey?: string` on the list composable's options interface (when pagination is there)

## What to remove

- `useTableQueryState().read()` / `useTableQueryPersistence` calls and their imports
- Event-driven `@search` handlers that only set a keyword and reload (replaced by RULE 2/5)
- Any manual `currentPage`/`skip` math used purely to restore a page from the URL

## Verification

1. `npx vue-tsc --noEmit` passes.
2. Sort a column, search, go to page 2 — the URL gains `<key>_sort`, `<key>_search`,
   `<key>_page`. Reload: the table restores the same view and shows results.
3. On page 2, type a search — the URL drops `_page` (reset to page 1) and results show.
4. No `useTableQueryState` / `useTableQueryPersistence` references remain.
