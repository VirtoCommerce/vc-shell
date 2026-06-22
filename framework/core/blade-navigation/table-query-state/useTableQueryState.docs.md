---
title: useTableQueryState
category: composables
group: data
---

# useTableQueryState

Reads the table view state (`sort`, `search`, `page`) that `VcDataTable` persists to the URL query for URL-addressable blades. A list page calls `read()` in `setup` to seed its own refs from the restored state before its loader runs, so a reload makes one request.

Read-only: writing the view state to the URL stays inside `VcDataTable`. This composable only exposes the restored values to the page.

## When to Use

- A list blade is URL-addressable (workspace or routable) and uses `VcDataTable` with a `state-key`
- You want a single, coordinated load on reload (sort + search + page restored together)
- You are wiring the page's combined loader watcher and need the restored seed values

## When NOT to Use

- The table is standalone or its blade has no URL — there is nothing to restore (`read()` returns `{}`)
- You only need the live view state — that already lives in your own `sortField`/`searchValue`/`currentPage` refs
- You want to _write_ to the URL — that is automatic; do not persist manually

## Basic Usage

```ts
import { ref, watch } from "vue";
import { useDataTableSort, useTableQueryState, useFunctions } from "@vc-shell/framework";

const PAGE_SIZE = 20;
const { debounce } = useFunctions();
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
const searchValue = ref<string>();
const currentPage = ref(1);

// Seed refs from the URL before the loader runs.
const restored = useTableQueryState("offers_list").read();
if (restored.sort) {
  const [field, dir] = restored.sort.split(":");
  sortField.value = field;
  sortOrder.value = dir === "DESC" ? -1 : 1;
}
if (restored.search) searchValue.value = restored.search;
if (restored.page) currentPage.value = restored.page;

function load() {
  return loadItems({
    sort: sortExpression.value,
    keyword: searchValue.value || undefined,
    skip: (currentPage.value - 1) * PAGE_SIZE,
  });
}

load();
watch(searchValue, () => (currentPage.value = 1));
watch([sortExpression, searchValue, currentPage], debounce(load, 300));
```

## API

### Parameters

| Parameter  | Type                  | Default     | Description                                                               |
| ---------- | --------------------- | ----------- | ------------------------------------------------------------------------- |
| `stateKey` | `string \| undefined` | `undefined` | The same `state-key` passed to `VcDataTable` for this table (namespacing) |

### Returns

| Property | Type                    | Description                                                                                            |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `read`   | `() => TableQueryPatch` | Reads the restored `{ sort?, search?, page? }` from the URL. Returns `{}` when no service is available |

`TableQueryPatch`: `{ sort?: string; search?: string; page?: number }` — `sort` is a `"field:ASC"` / `"field:DESC"` expression, `page` is 1-based.

## Details

- **Read in `setup`**: `VcDataTable` does not emit restore events on init; the page reads the state and seeds its refs in `setup`. This avoids a separate load per restored field.
- **No-op without a service**: When no blade provides the persistence service (standalone table, non-URL blade), `read()` returns `{}`, so you can call it unconditionally.
- **Write-back is automatic**: View state → URL (debounced `router.replace`) is handled by `VcDataTable` via `useTableQueryPersistence`. Pages do not persist manually.

## Tips

- Call `read()` once, synchronously, before the loader. Seeding after it runs causes an extra load.
- Use `useDataTablePagination`'s `setPage(n)` to seed the page without firing `onPageChange`.
- Pass the same `state-key` you give `VcDataTable`, so the URL keys match.

## Related

- [`useDataTableSort`](../../../ui/composables/useDataTableSort.docs.md) — sort state composable for `VcDataTable`
- [`useDataTablePagination`](../../../ui/composables/useDataTablePagination.docs.md) — pagination state composable (`setPage` for restore seed)
- `VcDataTable` → _URL query persistence_ — the write-back side of this contract
