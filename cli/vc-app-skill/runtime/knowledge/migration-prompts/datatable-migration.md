---
name: datatable-migration
description: AI transformation rules for VcTable → VcDataTable migration.
---

# DataTable Migration: VcTable → VcDataTable

Replace the imperative `VcTable` component (columns array, manual sort handlers, filter slots) with the declarative `VcDataTable` component. The new API uses `VcColumn` child components, declarative `v-model` bindings for sort and selection, and a `global-filters` prop instead of a `#filters` template slot.

## RULE 1: Component Swap and Props Rewrite

Full prop/event mapping:

| VcTable prop/event | VcDataTable equivalent |
|---|---|
| `:columns="columns"` | `<VcColumn>` child components (see RULE 2) |
| `:selected-item-id="id"` | `v-model:active-item-id="id"` |
| `:sort="sortExpression"` | `v-model:sort-field` + `v-model:sort-order` |
| `:multiselect="true"` | `:selection-mode="'multiple'"` |
| `@selection-changed="fn"` | `v-model:selection="ref"` |
| `:search-value="val"` | `:searchable="true"` (internal state) |
| `@search:change="fn"` | `@search="fn"` |
| `@item-click="fn"` | `@row-click="fn"` (different signature) |
| `@header-click="fn"` | Remove (sort is declarative via v-model) |
| `@scroll:ptr="fn"` | `:pull-to-refresh="true"` + `@pull-refresh="fn"` |
| `:pages` + `:current-page` | `:pagination="{ currentPage, pages }"` |
| `:active-filter-count` | Remove (managed by global-filters internally) |
| `<!--@vue-generic {T}-->` | Remove (no longer needed) |

**BEFORE:**

```vue
<template>
  <!--@vue-generic {OrderItem}-->
  <VcTable
    :columns="columns"
    :items="items"
    :loading="loading"
    :total-count="totalCount"
    :pages="pages"
    :current-page="currentPage"
    :search-value="searchValue"
    :selected-item-id="selectedItemId"
    :sort="sortExpression"
    :multiselect="true"
    :active-filter-count="activeFilterCount"
    @item-click="onItemClick"
    @header-click="onHeaderClick"
    @selection-changed="onSelectionChanged"
    @search:change="onSearchChange"
    @scroll:ptr="onPullToRefresh"
    @pagination-click="onPageChanged"
  >
    <template #item_name="{ item }">
      <span class="font-bold">{{ item.name }}</span>
    </template>
    <template #item_status="{ item }">
      <StatusBadge :status="item.status" />
    </template>
    <template #filters>
      <!-- filter checkboxes -->
    </template>
    <template #empty>
      <EmptyState @add="onAdd" />
    </template>
    <template #notfound>
      <NotFound @reset="onReset" />
    </template>
  </VcTable>
</template>
```

**AFTER:**

```vue
<template>
  <VcDataTable
    :items="items"
    :loading="loading"
    :total-count="totalCount"
    :pagination="{ currentPage, pages }"
    :searchable="true"
    :selection-mode="'multiple'"
    :pull-to-refresh="true"
    :global-filters="computedGlobalFilters"
    :empty-state="{
      icon: 'lucide-package-open',
      title: $t('MY_MODULE.PAGES.LIST.EMPTY'),
      actionLabel: $t('MY_MODULE.PAGES.LIST.ADD'),
      actionHandler: onAdd,
    }"
    v-model:active-item-id="selectedItemId"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:selection="localSelection"
    @row-click="onItemClick"
    @search="onSearchChange"
    @pull-refresh="onPullToRefresh"
    @pagination-click="onPageChanged"
    @filter="onFilter"
  >
    <VcColumn
      id="name"
      :title="$t('MY_MODULE.PAGES.LIST.TABLE.NAME')"
      :sortable="true"
      :always-visible="true"
      field="name"
    >
      <template #body="{ data }">
        <span class="font-bold">{{ data.name }}</span>
      </template>
    </VcColumn>
    <VcColumn
      id="status"
      :title="$t('MY_MODULE.PAGES.LIST.TABLE.STATUS')"
      type="status"
      field="status"
    >
      <template #body="{ data }">
        <StatusBadge :status="data.status" />
      </template>
    </VcColumn>
  </VcDataTable>
</template>
```

Key points:
- `<!--@vue-generic {T}-->` comment is removed entirely.
- `@header-click` is removed — sort is now declarative via `v-model:sort-field` and `v-model:sort-order`.
- `:active-filter-count` is removed — the `global-filters` prop manages filter state and badge count internally.
- `#filters`, `#empty`, and `#notfound` template slots are removed in favor of props (see RULE 6 and RULE 7).

## RULE 2: Columns Array → VcColumn Children

Column definition moves from a JavaScript array to `<VcColumn>` child components in the template.

Prop mapping:

| columns array key | VcColumn prop |
|---|---|
| `id` | `id` |
| `title` | `:title` |
| `sortable` | `:sortable` |
| `alwaysVisible` | `:always-visible` |
| `type` | `type` |
| `width` | `width` |
| `visible` | `:visible` |
| `field` | `:field` |
| `mobilePosition` (value: `"top-left"`, `"bottom-left"`, etc.) | `mobile-position` |
| `mobilePosition` (value: `"image"`, `"status"`) | `mobile-role` |

**BEFORE:**

```typescript
const columns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("MY_MODULE.PAGES.LIST.TABLE.IMAGE")),
    width: 60,
    alwaysVisible: true,
    mobilePosition: "image",
  },
  {
    id: "name",
    title: computed(() => t("MY_MODULE.PAGES.LIST.TABLE.NAME")),
    sortable: true,
    alwaysVisible: true,
    mobilePosition: "top-left",
  },
  {
    id: "status",
    title: computed(() => t("MY_MODULE.PAGES.LIST.TABLE.STATUS")),
    type: "status",
    width: 120,
    mobilePosition: "status",
  },
  {
    id: "createdDate",
    title: computed(() => t("MY_MODULE.PAGES.LIST.TABLE.CREATED")),
    sortable: true,
    width: 160,
    type: "date-ago",
    mobilePosition: "bottom-right",
  },
  {
    id: "modifiedDate",
    title: computed(() => t("MY_MODULE.PAGES.LIST.TABLE.MODIFIED")),
    sortable: true,
    width: 160,
    type: "date-ago",
    visible: false,
  },
]);
```

**AFTER:**

```vue
<VcDataTable :items="items" :loading="loading" :total-count="totalCount">
  <VcColumn
    id="imgSrc"
    :title="$t('MY_MODULE.PAGES.LIST.TABLE.IMAGE')"
    width="60"
    :always-visible="true"
    mobile-role="image"
  />
  <VcColumn
    id="name"
    :title="$t('MY_MODULE.PAGES.LIST.TABLE.NAME')"
    :sortable="true"
    :always-visible="true"
    mobile-position="top-left"
    field="name"
  />
  <VcColumn
    id="status"
    :title="$t('MY_MODULE.PAGES.LIST.TABLE.STATUS')"
    type="status"
    width="120"
    mobile-role="status"
    field="status"
  />
  <VcColumn
    id="createdDate"
    :title="$t('MY_MODULE.PAGES.LIST.TABLE.CREATED')"
    :sortable="true"
    width="160"
    type="date-ago"
    mobile-position="bottom-right"
    field="createdDate"
  />
  <VcColumn
    id="modifiedDate"
    :title="$t('MY_MODULE.PAGES.LIST.TABLE.MODIFIED')"
    :sortable="true"
    width="160"
    type="date-ago"
    :visible="false"
    field="modifiedDate"
  />
</VcDataTable>
```

Custom slot transformation — the slot name changes from `#item_{columnId}` to `#body` inside the `<VcColumn>`, and `item` becomes `data`:

```vue
<!-- BEFORE -->
<VcTable :columns="columns" :items="items">
  <template #item_name="{ item }">
    <MyRenderer :item="item" />
  </template>
</VcTable>

<!-- AFTER -->
<VcDataTable :items="items">
  <VcColumn id="name" :title="$t('MY_MODULE.PAGES.LIST.TABLE.NAME')">
    <template #body="{ data }">
      <MyRenderer :item="data" />
    </template>
  </VcColumn>
</VcDataTable>
```

Key points:
- Remove the entire `columns` ref/reactive from the script section.
- Remove the `ITableColumns` import if it was only used for the columns array.
- The `mobilePosition` value `"image"` or `"status"` maps to `mobile-role`, not `mobile-position`. All other position values (`"top-left"`, `"bottom-left"`, `"top-right"`, `"bottom-right"`) map to `mobile-position`.
- The `field` prop tells VcColumn which property of the row object to display by default. If you have a custom `#body` slot, `field` is optional but still recommended for sort/filter binding.
- **VcDataTable does NOT have a `:columns` prop.** Never pass columns as a prop — always use `<VcColumn>` children.

## RULE 2b: Dynamic Columns (received via props)

When a reusable component receives columns as a prop (e.g., `columns: ITableColumns[]`), use `v-for` on `<VcColumn>`:

**BEFORE:**

```vue
<VcTable :columns="columns" :items="items" />
```

```typescript
export interface Props {
  columns: ITableColumns[];
  items: Item[];
}
```

**AFTER:**

```vue
<VcDataTable :items="items">
  <VcColumn
    v-for="col in columns"
    :key="col.id"
    :id="col.id"
    :title="col.title"
    :sortable="col.sortable"
    :always-visible="col.alwaysVisible"
    :type="col.type"
    :width="col.width"
    :visible="col.visible"
    :field="col.field"
  />
</VcDataTable>
```

The Props interface keeps `columns` — the parent still passes column definitions. The difference is that they are rendered as `<VcColumn>` children via `v-for`, not as a `:columns` prop.

## RULE 3: Sort Composable Replacement

Replace `useTableSort` with `useDataTableSort`. The new composable returns `sortField` and `sortOrder` as separate refs that bind directly to `v-model:sort-field` and `v-model:sort-order`. Remove the `onHeaderClick` handler entirely.

**BEFORE:**

```typescript
import { useTableSort } from "@vc-shell/framework";
import type { ITableColumns } from "@vc-shell/framework";

const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});

function onHeaderClick(item: ITableColumns) {
  handleSortChange(item.id);
}

// In the watcher that triggers data reload:
watch(sortExpression, async () => {
  await load({ sort: sortExpression.value, skip: 0 });
});
```

**AFTER:**

```typescript
import { useDataTableSort } from "@vc-shell/framework";

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

// Remove onHeaderClick entirely — sort is declarative via v-model.
// The watcher remains the same, watching the computed sortExpression:
watch(sortExpression, async () => {
  await load({ sort: sortExpression.value, skip: 0 });
});
```

Key points:
- `initialProperty` is renamed to `initialField`.
- `handleSortChange` is removed — the `v-model:sort-field` and `v-model:sort-order` bindings on VcDataTable handle sort changes automatically.
- `sortExpression` is still available as a computed string (e.g., `"createdDate:DESC"`) for the API call watcher.
- Remove `onHeaderClick` and its `@header-click` binding from the template.
- Remove the `ITableColumns` type import if it was only used for the `onHeaderClick` parameter.

## RULE 4: Selection Binding

Replace the `@selection-changed` event handler with a `v-model:selection` binding. The selection ref holds the full item objects, not just IDs.

**BEFORE:**

```typescript
const selectedIds = ref<string[]>([]);

function onSelectionChanged(items: OrderItem[]) {
  selectedIds.value = items.map((i) => i.id!);
}
```

```vue
<VcTable
  :multiselect="true"
  @selection-changed="onSelectionChanged"
/>
```

**AFTER:**

```typescript
const localSelection = ref<OrderItem[]>([]);

// If you need IDs for an API call, derive them with a watcher or computed:
const selectedIds = computed(() => localSelection.value.map((i) => i.id!));

// Or use a watcher if you need side-effects:
watch(localSelection, (newSelection) => {
  // e.g., enable/disable toolbar buttons based on selection
  hasSelection.value = newSelection.length > 0;
}, { deep: true });
```

```vue
<VcDataTable
  :selection-mode="'multiple'"
  v-model:selection="localSelection"
/>
```

Key points:
- The `localSelection` ref holds full item objects (typed to your entity), not string IDs.
- Remove the `onSelectionChanged` function entirely.
- `:multiselect="true"` becomes `:selection-mode="'multiple'"`.
- If you only need a boolean "has selection" check, derive it from `localSelection.value.length > 0`.

## RULE 5: Row Click Event Signature

The `@row-click` event wraps the item in an `{ data }` object, unlike `@item-click` which passed the item directly.

**BEFORE:**

```typescript
function onItemClick(item: OrderItem) {
  openBlade({
    name: "OrderDetails",
    param: item.id,
    options: { orderId: item.id },
  });
}
```

```vue
<VcTable @item-click="onItemClick" />
```

**AFTER:**

```typescript
function onItemClick(event: { data: OrderItem }) {
  const item = event.data;
  openBlade({
    name: "OrderDetails",
    param: item.id,
    options: { orderId: item.id },
  });
}
```

```vue
<VcDataTable @row-click="onItemClick" />
```

Key points:
- The parameter changes from `item: T` to `event: { data: T }`.
- Destructure `event.data` at the top of the handler to minimize changes in the rest of the function body.
- If the handler was a simple one-liner, you can also inline the destructure: `(event: { data: OrderItem }) => openBlade({ name: "OrderDetails", param: event.data.id })`.

## RULE 6: Empty State and Not-Found

Replace `#empty` and `#notfound` template slots with the `:empty-state` prop.

**BEFORE:**

```vue
<VcTable :columns="columns" :items="items">
  <template #empty>
    <div class="empty-state">
      <VcIcon icon="lucide-package-open" size="xl" />
      <p>{{ $t("MY_MODULE.PAGES.LIST.EMPTY_TITLE") }}</p>
      <VcButton @click="onAdd">
        {{ $t("MY_MODULE.PAGES.LIST.ADD_BUTTON") }}
      </VcButton>
    </div>
  </template>
  <template #notfound>
    <div class="not-found-state">
      <VcIcon icon="lucide-search-x" size="xl" />
      <p>{{ $t("MY_MODULE.PAGES.LIST.NOT_FOUND") }}</p>
      <VcButton @click="onResetSearch">
        {{ $t("MY_MODULE.PAGES.LIST.RESET_SEARCH") }}
      </VcButton>
    </div>
  </template>
</VcTable>
```

**AFTER:**

```vue
<VcDataTable
  :items="items"
  :empty-state="{
    icon: 'lucide-package-open',
    title: $t('MY_MODULE.PAGES.LIST.EMPTY_TITLE'),
    actionLabel: $t('MY_MODULE.PAGES.LIST.ADD_BUTTON'),
    actionHandler: onAdd,
  }"
  :not-found-state="{
    icon: 'lucide-search-x',
    title: $t('MY_MODULE.PAGES.LIST.NOT_FOUND'),
    actionLabel: $t('MY_MODULE.PAGES.LIST.RESET_SEARCH'),
    actionHandler: onResetSearch,
  }"
/>
```

Key points:
- Remove `#empty` and `#notfound` template slots entirely.
- Remove dedicated empty/not-found `.vue` components if they only rendered an icon, title, and action button.
- `:empty-state` shows when there are no items at all (no search active). Props: `icon`, `title`, `actionLabel`, `actionHandler`.
- `:not-found-state` shows when a search is active but returned no results. Same props as `:empty-state`. If omitted, VcDataTable uses a default not-found message.
- Both are **separate props** — do NOT combine them into one.

## RULE 7: Filters — Template Slot → global-filters Prop

This is the most complex transformation. Replace the `#filters` template slot (with staged filter state, apply/reset buttons, and checkbox loops) with a declarative `global-filters` prop and `@filter` event.

**DO NOT SKIP THIS RULE even if filter types look exotic.** Real apps often have date-range pickers, multi-select dropdowns, and enum selects alongside checkboxes. Each of these maps to a `GlobalFilterConfig` entry with an appropriate `type` (`"multi-select"`, `"date-range"`, `"select"`, `"text"`, etc.) and `options`. If a single filter type does not fit any documented `GlobalFilterConfig.type`, map the other filters and flag the one holdout in your report — **do NOT delete the whole filter panel.** "Removed to get the build green" is not an acceptable resolution: the user loses UX. If in doubt, keep the existing `<template #filters>` slot unchanged and mark the file as needing manual migration in the report, rather than erasing user-visible functionality.

**BEFORE:**

```typescript
// --- Staged filter state ---
const statuses = ref([
  { value: "New", displayValue: "New" },
  { value: "Processing", displayValue: "Processing" },
  { value: "Completed", displayValue: "Completed" },
]);

const stagedFilters = reactive({
  status: [] as string[],
});
const appliedFilters = reactive({
  status: [] as string[],
});

const hasFilterChanges = computed(
  () => JSON.stringify(stagedFilters) !== JSON.stringify(appliedFilters),
);
const hasFiltersApplied = computed(() => appliedFilters.status.length > 0);
const activeFilterCount = computed(() =>
  hasFiltersApplied.value ? appliedFilters.status.length : 0,
);

function toggleFilter(group: "status", value: string) {
  const idx = stagedFilters[group].indexOf(value);
  if (idx > -1) {
    stagedFilters[group].splice(idx, 1);
  } else {
    stagedFilters[group].push(value);
  }
}

async function applyFilters() {
  Object.assign(appliedFilters, JSON.parse(JSON.stringify(stagedFilters)));
  await load({ statuses: appliedFilters.status, skip: 0 });
}

function resetFilters() {
  stagedFilters.status = [];
  appliedFilters.status = [];
  load({ statuses: [], skip: 0 });
}
```

```vue
<VcTable
  :columns="columns"
  :items="items"
  :active-filter-count="activeFilterCount"
>
  <template #filters>
    <div class="filters-panel">
      <h4>{{ $t("MY_MODULE.PAGES.LIST.FILTERS.STATUS") }}</h4>
      <VcCheckbox
        v-for="status in statuses"
        :key="status.value"
        :model-value="stagedFilters.status.includes(status.value)"
        @update:model-value="toggleFilter('status', status.value)"
      >
        {{ status.displayValue }}
      </VcCheckbox>
      <div class="filters-actions">
        <VcButton
          variant="primary"
          :disabled="!hasFilterChanges"
          @click="applyFilters"
        >
          {{ $t("MY_MODULE.PAGES.LIST.FILTERS.APPLY") }}
        </VcButton>
        <VcButton
          variant="outline"
          :disabled="!hasFiltersApplied"
          @click="resetFilters"
        >
          {{ $t("MY_MODULE.PAGES.LIST.FILTERS.RESET") }}
        </VcButton>
      </div>
    </div>
  </template>
</VcTable>
```

**AFTER:**

```typescript
const statuses = ref([
  { value: "New", displayValue: "New" },
  { value: "Processing", displayValue: "Processing" },
  { value: "Completed", displayValue: "Completed" },
]);

const computedGlobalFilters = computed(() => [
  {
    id: "status",
    label: t("MY_MODULE.PAGES.LIST.FILTERS.STATUS"),
    filter: {
      options: statuses.value.map((s) => ({
        value: s.value ?? "",
        label: s.displayValue ?? "",
      })),
      multiple: true,
    },
  },
]);

async function onFilter(event: { filters: Record<string, unknown> }) {
  const statusFilter = event.filters.status as string[] | undefined;
  await load({ statuses: statusFilter ?? [], skip: 0 });
}
```

```vue
<VcDataTable
  :items="items"
  :global-filters="computedGlobalFilters"
  @filter="onFilter"
>
  <!-- VcColumn children here -->
</VcDataTable>
```

Remove all of the following explicitly:
- `stagedFilters` reactive object
- `appliedFilters` reactive object
- `hasFilterChanges` computed
- `hasFiltersApplied` computed
- `activeFilterCount` computed
- `toggleFilter` function
- `applyFilters` function
- `resetFilters` function
- `:active-filter-count` prop on the table component
- `#filters` template slot and all its contents (checkboxes, apply/reset buttons)
- Any filter-related CSS classes (`.filters-panel`, `.filters-actions`, etc.)

Key points:
- The `global-filters` prop accepts an array of filter descriptors. Each descriptor has `id`, `label`, and a `filter` object with `options` and `multiple`.
- VcDataTable renders the filter UI internally — no manual checkbox loops or apply/reset buttons.
- The `@filter` event fires when the user applies filters. The `event.filters` object is keyed by filter `id`, with values matching the selected option values.
- The active filter count badge is managed internally by VcDataTable — no need for a manual `activeFilterCount` computed.

## RULE 8: Pagination — Manual Calculation → useDataTablePagination

Replace manual `pages`/`currentPage` computed properties and `@pagination-click` handlers with the `useDataTablePagination` composable. The composable manages skip/page math internally and returns a reactive pagination object that VcDataTable consumes directly.

**BEFORE (composable):**

```typescript
import { computed, ref } from "vue";
import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";

export function useMyList(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref({ take: pageSize, skip: 0, sort: "createdDate:desc" });
  const searchResult = ref();

  const { action: loadItems, loading } = useAsync(async (query) => {
    searchQuery.value = { ...searchQuery.value, ...query };
    searchResult.value = await (await getApiClient()).search(searchQuery.value);
  });

  return {
    items: computed(() => searchResult.value?.results || []),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
    currentPage: computed(() => Math.ceil((searchQuery.value.skip || 0) / pageSize + 1)),
    searchQuery,
    loadItems,
    loading,
  };
}
```

**AFTER (composable):**

```typescript
import { computed, ref } from "vue";
import { useApiClient, useAsync, useLoading, useDataTablePagination, type UseDataTablePaginationReturn } from "@vc-shell/framework";

export function useMyList(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref({ take: pageSize, skip: 0, sort: "createdDate:desc" });
  const searchResult = ref();

  const { action: loadItems, loading } = useAsync(async (query) => {
    searchQuery.value = { ...searchQuery.value, ...query };
    searchResult.value = await (await getApiClient()).search(searchQuery.value);
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

**BEFORE (blade page):**

```vue
<VcDataTable
  :pagination="{ currentPage, pages }"
  @pagination-click="onPaginationClick"
/>
```

```typescript
const { items, totalCount, pages, currentPage, loadItems, loading } = useMyList();

const onPaginationClick = async (page: number) => {
  await loadItems({ ...searchQuery.value, skip: (page - 1) * 20 });
};
```

**AFTER (blade page):**

```vue
<VcDataTable
  :pagination="pagination"
  :total-count="pagination.totalCount"
  @pagination-click="pagination.goToPage"
/>
```

```typescript
const { items, pagination, loadItems, loading } = useMyList();
// No manual onPaginationClick — pagination.goToPage handles it
```

**What to remove:**
- `totalCount`, `pages`, `currentPage` computed from composable return
- Manual `onPaginationClick` function in blade pages
- Manual `skip` calculation `(page - 1) * pageSize`

**What to add:**
- `useDataTablePagination` import in composable
- `pagination` object in composable return
- `:pagination="pagination"` and `@pagination-click="pagination.goToPage"` in template

## Verification

After migration:

1. Run `vue-tsc --noEmit` (or `npx tsc --noEmit`) to verify no TypeScript errors
2. Confirm the table renders with correct columns, data, and layout
3. Confirm sorting works: click a sortable column header, verify the sort indicator toggles, verify the data reloads with the correct sort expression
4. Confirm selection works: check rows, verify `localSelection` updates, verify toolbar buttons respond to selection state
5. Confirm filters work: open the filter panel, select filter options, apply, verify the data reloads with correct filter parameters, verify the active filter badge shows
6. Confirm the empty state shows when there are no items (correct icon, title, and action button)
7. Confirm row click navigates correctly: click a row, verify the correct blade opens with the correct parameters (remember the `{ data }` wrapper)
8. Confirm pull-to-refresh works if enabled
9. Confirm pagination works: navigate between pages, verify data reloads
10. Confirm no stale imports remain: `useTableSort`, `ITableColumns`, `columns` ref, staged/applied filter state, `@header-click`, `@selection-changed`, `@item-click`, `#filters`, `#empty`, `#notfound`
