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
  @headerClick="onSort"
  @selectionChanged="onSelect"
>
  <template #item_name="{ item }">
    {{ item.name }}
  </template>
</VcTable>

<!-- New: VcDataTable with VcColumn -->
<VcDataTable :items="items" @sort-changed="onSort" @selection-changed="onSelect">
  <VcColumn id="name" header="Name" sortable>
    <template #default="{ item }">
      {{ item.name }}
    </template>
  </VcColumn>
  <VcColumn id="status" header="Status" type="status" />
  <VcColumn id="date" header="Date" type="datetime" sortable />
</VcDataTable>
```

### Key API Differences

| VcTable (adapter) | VcDataTable |
|---|---|
| `:columns="[{...}]"` | `<VcColumn>` children |
| `type: "date-time"` | `type="datetime"` |
| `#item_fieldName` slot | `#default` slot on VcColumn |
| `@headerClick` | `@sort-changed` |
| `@selectionChanged` | `@selection-changed` |
| `:selectedItemId` | `:active-item-id` |
| `multiselect` prop | `selection-mode="multiple"` |

### New Features (only in VcDataTable)

- Column switcher (`column-switcher` prop)
- Global filters (`global-filters` prop)
- Pull-to-refresh on mobile
- Virtual scroll for large datasets
- Row drag-and-drop reorder
- Inline cell editing
- Column resize and reorder with state persistence

## How to Find

```bash
# Find VcTable usage in templates
grep -rn '<VcTable\b\|<vc-table\b' src/ --include="*.vue"
# Find columns prop definitions
grep -rn ':columns=' src/ --include="*.vue"
```
