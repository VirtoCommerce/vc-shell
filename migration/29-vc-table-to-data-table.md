# 29. VcTable → VcDataTable

## What Changed

The old `VcTable` component has been **removed**. It is replaced by two components:

| Component | Purpose |
|---|---|
| `VcDataTable` | New compositional table with `<VcColumn>` declarative API |
| `VcTableAdapter` (exported as `VcTable`) | Adapter: wraps `VcDataTable` with the old `VcTable` prop-based API |

The name `VcTable` now points to `VcTableAdapter` for backward compatibility.

## If You Use `<VcTable>` with Props-Based API

**No immediate action required.** The `VcTableAdapter` handles the old API surface:

- `:columns` prop → mapped to `<VcColumn>` internally
- `:items`, `:sort`, `:multiselect`, `:selectedItemId` → forwarded
- All events (`@selectionChanged`, `@headerClick`, `@itemClick`, etc.) → forwarded

Known adapter limitation: parent passes `:sort-expression` but adapter prop name is `sort` — `props.sort` is always `undefined`. The adapter uses an internal `lastSortField` ref as fallback.

## Migrating to VcDataTable (Recommended)

The new `VcDataTable` uses a declarative `<VcColumn>` API similar to PrimeVue DataTable:

```vue
<!-- Old: VcTable with columns prop -->
<VcTable
  :columns="columns"
  :items="items"
  :sort="sortExpression"
  :selected-item-id="selectedItemId"
  :pages="pages"
  :current-page="currentPage"
  :total-count="totalCount"
  :expanded="expanded"
  :active-filter-count="activeFilterCount"
  column-selector="defined"
  state-key="MY_TABLE"
  :multiselect="false"
  :search-value="searchKeyword"
  @item-click="onItemClick"
  @header-click="onHeaderClick"
  @pagination-click="onPaginationClick"
  @search:change="onSearchChange"
  @selection-changed="onSelectionChanged"
>
  <template #item_name="{ item }">
    {{ item.name }}
  </template>
  <template #filters>
    <!-- custom filter UI -->
  </template>
</VcTable>

<!-- New: VcDataTable with VcColumn -->
<VcDataTable
  v-model:active-item-id="selectedItemId"
  v-model:sort-field="sortField"
  v-model:sort-order="sortOrder"
  :items="items"
  :total-count="totalCount"
  :pagination="{ currentPage, pages }"
  :show-all-columns="expanded"
  :global-filters="globalFilters"
  state-key="MY_TABLE"
  :searchable="true"
  @row-click="onItemClick"
  @pagination-click="onPaginationClick"
  @search="onSearchChange"
  @filter="onFilter"
>
  <VcColumn id="name" :title="t('...')" :sortable="true" :always-visible="true">
    <template #body="{ data }">
      {{ data.name }}
    </template>
  </VcColumn>
  <VcColumn id="status" :title="t('...')" type="status" :sortable="true" />
  <VcColumn id="date" :title="t('...')" type="datetime" :sortable="true" />
</VcDataTable>
```

### Key API Differences

| VcTable (adapter) | VcDataTable |
|---|---|
| `:columns="[{...}]"` | `<VcColumn>` children |
| `type: "date-time"` | `type="datetime"` |
| `#item_fieldName="{ item }"` slot | `#body="{ data }"` slot on VcColumn |
| `:selectedItemId` | `v-model:active-item-id` |
| `:sort` (string `"field:DIR"`) | `v-model:sort-field` + `v-model:sort-order` (use `useDataTableSort`) |
| `@headerClick` | `@sort` event `{ sortField, sortOrder }` (or use `v-model` + watch `sortExpression`) |
| `@item-click` (receives item directly) | `@row-click` event `{ data, index, originalEvent }` |
| `@selectionChanged` | `@selection-changed` / `update:selection` |
| `@search:change` + manual debounce | `@search` (built-in debounce via `:search-debounce`) |
| `:pages` + `:current-page` | `:pagination="{ pages, currentPage }"` |
| `:expanded` | `:show-all-columns` |
| `column-selector="defined"` | `:column-switcher="'defined'"` |
| `:active-filter-count` + `#filters` slot | `:global-filters` prop + `@filter` event (built-in filter panel) |
| `:search-value` + `@search:change` | `:searchable="true"` + `@search` |
| `multiselect` prop | `selection-mode="multiple"` |
| `useTableSort()` composable | `useDataTableSort()` composable |

### Sorting Migration

Replace `useTableSort` with `useDataTableSort` and use `v-model` binding:

```ts
// Old
import { useTableSort } from "@vc-shell/framework";
const { sortExpression, handleSortChange } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});
// + @header-click handler calling handleSortChange(column.id)

// New
import { useDataTableSort } from "@vc-shell/framework";
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
// sortField/sortOrder bind via v-model, sortExpression is a computed "field:DIR" string for API calls
// Watch sortExpression to trigger reload:
watch(sortExpression, async (newVal) => {
  await load({ ...searchQuery.value, sort: newVal });
});
```

### Filters Migration

Replace custom `#filters` slot with declarative `:global-filters` prop:

```ts
// Old: manual filter UI with staged/applied pattern, radio buttons, date inputs, apply/reset buttons
// New: declarative config — VcDataTable renders the filter panel automatically
const globalFilters = computed(() => [
  {
    id: "status",
    label: t("FILTER.STATUS.TITLE"),
    filter: {
      options: statuses.value.map((s) => ({ value: s.value ?? "", label: s.displayValue ?? "" })),
    },
  },
  {
    id: "dateRange",
    label: t("FILTER.DATE.TITLE"),
    filter: {
      range: ["startDate", "endDate"] as [string, string],
    },
  },
]);

// Handle @filter event — filters object has flat key/value pairs from the filter panel
async function onFilter(event: { filters: Record<string, unknown> }) {
  await load({
    ...searchQuery.value,
    status: event.filters.status as string | undefined,
    startDate: event.filters.startDate ? new Date(event.filters.startDate as string) : undefined,
    endDate: event.filters.endDate ? new Date(event.filters.endDate as string) : undefined,
    skip: 0,
  });
}
```

Filter types:
- **Select**: `{ options: Array<{ value: string; label: string }>, multiple?: boolean }`
- **Date range**: `{ range: [startFieldName, endFieldName] }`
- **Text**: `true` or `"fieldName"`

### VcColumn Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique column identifier |
| `field` | `string` | same as `id` | Data field path |
| `title` | `string` | — | Header text |
| `type` | `CellType` | `"text"` | Cell formatter: `text`, `number`, `money`, `date`, `date-ago`, `time`, `datetime`, `image`, `link`, `html`, `status`, `status-icon` |
| `width` | `string \| number` | — | Column width (`"75px"`, `200`) |
| `sortable` | `boolean` | `false` | Enable sorting |
| `always-visible` | `boolean` | `false` | Stay visible when `showAllColumns=false` |
| `visible` | `boolean` | `true` | Initial visibility |
| `mobile-role` | `"title" \| "image" \| "field" \| "status"` | — | Mobile card role |
| `mobile-position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | — | Mobile grid position |
| `editable` | `boolean` | `false` | Enable inline editing |
| `align` | `"start" \| "center" \| "end"` | — | Cell text alignment |

### New Features (only in VcDataTable)

- Column switcher (`column-switcher` prop — `true`, `'defined'`, or `false`)
- Global filters (`global-filters` prop with declarative filter configs)
- Pull-to-refresh on mobile (`pull-to-refresh` prop)
- Virtual scroll for large datasets
- Row drag-and-drop reorder (`reorderable-rows` prop)
- Inline cell editing (`edit-mode` prop)
- Column resize and reorder with state persistence (`state-key` + `state-storage`)
- Built-in search with debounce (`searchable` + `search-debounce`)
- Empty/not-found states (`empty-state` + `not-found-state` props)
- Infinite scroll (`infinite-scroll` prop)

### Import Changes

```ts
// Old
import { ITableColumns, useTableSort } from "@vc-shell/framework";

// New — ITableColumns and useTableSort are no longer needed
import { useDataTableSort } from "@vc-shell/framework";
// VcDataTable and VcColumn are auto-registered globally, no explicit import required
// (but you can import them explicitly if preferred)
```

## How to Find

```bash
# Find VcTable usage in templates
grep -rn '<VcTable\b\|<vc-table\b' src/ --include="*.vue"
# Find columns prop definitions
grep -rn ':columns=' src/ --include="*.vue"
# Find useTableSort usage (replace with useDataTableSort)
grep -rn 'useTableSort' src/ --include="*.ts" --include="*.vue"
# Find #item_ slot patterns (replace with #body on VcColumn)
grep -rn '#item_' src/ --include="*.vue"
# Find #filters slot (replace with :global-filters prop)
grep -rn '#filters' src/ --include="*.vue"
```
