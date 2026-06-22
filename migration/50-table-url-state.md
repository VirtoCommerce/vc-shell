# 50. Table URL State — Composable-Owned Persistence

## What Changed

Sort, search keyword, and page number can now be persisted to the blade URL directly
from the state composables by passing a `stateKey` option. Previously this required
`useTableQueryPersistence` inside `VcDataTable`, which has been removed.

Key points:

- `useDataTableSort({ stateKey, initialField, initialDirection })` — with `stateKey`,
  reads the initial sort from the URL and writes back on every sort change.
- `useTableSearch({ stateKey })` — returns `{ searchValue }`. With `stateKey`, restores
  and persists the keyword to the URL.
- `useDataTablePagination({ stateKey, pageSize, totalCount })` — with `stateKey`,
  restores and persists the current page to the URL.
- Without `stateKey`, all three composables behave exactly as before (opt-in,
  non-breaking).
- The table `state-key` prop remains column-layout persistence only (widths, order,
  visibility). It does NOT control URL query state.

## Before (no URL persistence)

```typescript
// blade script setup
import { ref, watch, onMounted } from "vue";
import { useDataTableSort, useDataTablePagination } from "@vc-shell/framework";
import { useOffers } from "../composables/useOffers";

const { getOffers, items, totalCount, loading } = useOffers();
const searchValue = ref("");

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

const { currentPage, pages, skip, goToPage } = useDataTablePagination({
  pageSize: 20,
  totalCount,
});

function load() {
  return getOffers({
    sort: sortExpression.value,
    keyword: searchValue.value || undefined,
    skip,
    take: 20,
  });
}

onMounted(() => load());
watch(searchValue, () => goToPage(1));
watch([sortExpression, searchValue, () => skip], load);
```

```vue
<template>
  <VcDataTable
    :items="items"
    :loading="loading"
    :total-count="totalCount"
    :pagination="{ currentPage, pages }"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:search-value="searchValue"
    :searchable="true"
    state-key="offers_list"
    @pagination-click="goToPage"
  />
</template>
```

## After (with URL persistence)

Add `stateKey` to each composable. Replace the bare `searchValue` ref with
`useTableSearch`. Nothing else changes.

```typescript
// blade script setup
import { watch, onMounted } from "vue";
import { useDataTableSort, useDataTablePagination, useTableSearch } from "@vc-shell/framework";
import { useOffers } from "../composables/useOffers";
import { debounce } from "lodash-es";

const { getOffers, items, totalCount, loading } = useOffers();

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  stateKey: "offers_list",
  initialField: "createdDate",
  initialDirection: "DESC",
});

const { searchValue } = useTableSearch({ stateKey: "offers_list" });

const pagination = useDataTablePagination({
  stateKey: "offers_list",
  pageSize: 20,
  totalCount,
});

function load() {
  return getOffers({
    sort: sortExpression.value,
    keyword: searchValue.value || undefined,
    skip: pagination.skip,
    take: 20,
  });
}

onMounted(() => load());
watch(searchValue, () => pagination.setPage(1));
watch([sortExpression, searchValue, () => pagination.skip], debounce(load, 300));
```

```vue
<template>
  <VcDataTable
    :items="items"
    :loading="loading"
    :total-count="pagination.totalCount"
    :pagination="pagination"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:search-value="searchValue"
    :searchable="true"
    state-key="offers_list"
    @pagination-click="pagination.goToPage"
  />
</template>
```

The `stateKey` string must be the same across all three composables and may match the
table `state-key` — they are independent stores (URL query vs. localStorage).

## Migrating from the v2.0.11 Preview Form

If you briefly used the pre-release `useTableQueryState().read()` pattern to seed sort
and pagination refs manually, remove that block and adopt `stateKey` instead:

1. Delete any `useTableQueryState().read()` call and the manual ref-seeding it drove.
2. Add `stateKey` to `useDataTableSort`, `useDataTablePagination`, and
   `useTableSearch` as shown above.
3. Replace a bare `const searchValue = ref("")` with
   `const { searchValue } = useTableSearch({ stateKey: "..." })`.
4. Replace any manual `currentPage`/`pages` refs or computed properties with
   `useDataTablePagination({ stateKey, pageSize, totalCount })` and access page
   state via `pagination.currentPage`, `pagination.pages`, `pagination.skip`.

## Migration Steps

1. Add `stateKey` to `useDataTableSort` — same key for all three composables on a
   given blade.
2. Replace `const searchValue = ref("")` with
   `const { searchValue } = useTableSearch({ stateKey })`.
3. Add `stateKey` to `useDataTablePagination`.
4. Update load calls to use `pagination.skip` (not a manually computed skip).
5. Update the template: `:pagination="pagination"`, `@pagination-click="pagination.goToPage"`,
   `v-model:search-value="searchValue"`.
6. Keep `state-key` on `<VcDataTable>` as-is — it controls column layout, not URL state.

## How to Find

```bash
# Blades using useDataTableSort without stateKey
grep -rn 'useDataTableSort({' src/ --include="*.ts" --include="*.vue" | grep -v stateKey

# Blades using bare searchValue ref with VcDataTable searchable
grep -rn 'searchValue = ref' src/ --include="*.ts" --include="*.vue"

# Any leftover useTableQueryPersistence references (should be zero after upgrade)
grep -rn 'useTableQueryPersistence\|useTableQueryState' src/ --include="*.ts" --include="*.vue"
```

## Related

- [Guide 31 — useDataTableSort](./31-use-data-table-sort.md)
- [Guide 41 — useDataTablePagination](./41-use-data-table-pagination.md)
