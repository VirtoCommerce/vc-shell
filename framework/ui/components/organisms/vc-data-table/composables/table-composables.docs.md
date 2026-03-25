# VcTable Composables

Composables that power VcDataTable's functionality. Each handles a single concern and is wired together by the table component. Module developers rarely use these directly -- they are consumed internally by `VcDataTable.vue`.

## Overview

The composables follow a PrimeVue-inspired pattern: each returns reactive state and handler functions that the table component binds to its template. They communicate via shared refs passed through options objects.

## Composable Catalog

### Data & State

| Composable | Purpose |
|---|---|
| `useDataTableState` | Persists column widths, order, and hidden IDs to localStorage/sessionStorage. Key format: `VC_DATATABLE_{KEY}`. Debounced auto-save (150ms) with restore-on-mount. |
| `useTableColumns` | Column ordering, width tracking, alignment helpers, flex-column detection. Watches `visibleColumns` and appends new columns without dropping hidden ones. |
| `useDataProcessing` | Client-side sort pipeline (single/multi) and row grouping. Skipped when `lazy: true` (server-side). |
| `useTableContext` | Provides/injects table-level context for sub-components. |

### Sorting & Filtering

| Composable | Purpose |
|---|---|
| `useTableSort` | Single and multi-sort with removable sort (asc -> desc -> none cycle). Ctrl+click for multi-sort. Syncs with external props. |
| `useFilterState` | Collects per-column filter values and builds flat backend payloads. Supports text, select, and dateRange filters. Tracks `hasActiveFilters` and `activeFilterCount`. |
| `useColumnFilter` | Declarative filter config utilities: type guards (`isSelectFilter`, `isDateRangeFilter`), field resolution, options extraction. |

### Interaction

| Composable | Purpose |
|---|---|
| `useTableRowReorder` | Drag-and-drop row reordering with live-swap at 50% vertical threshold. Commits via `dragend` (always fires) with `drop` as preferred path. |
| `useTableColumnsReorder` | Drag-and-drop column reordering with 50% horizontal threshold. Returns `getReorderHeadProps()` for easy binding. |
| `useTableColumnsResize` | Two-column resize: dragging grows left column and shrinks right neighbor. DOM-based updates during drag for smooth 60fps; commits to reactive state on mouseup. |
| `useTableSelectionV2` | Row selection: single, multiple (checkbox), and row-click modes. Emits `RowSelectEvent` / `RowSelectAllEvent`. |
| `useTableSwipe` | Mobile swipe context (provide/inject). Tracks which row has an active swipe action. |

### Editing

| Composable | Purpose |
|---|---|
| `useTableEditing` | Cell-level and row-level editing (PrimeVue-style). Stores editing copies in `editingMeta` so typing does not trigger re-renders on the original data. |
| `useTableInlineEdit` | Bulk inline editing mode (all rows editable simultaneously). Different from `useTableEditing`. |
| `useCellBase` | Base composable for editable cell components: blur handling, display formatting, empty-state detection. |
| `useCellRegistry` | Registry pattern for cell type components (text, number, money, date, status, etc.). Register custom cell types at runtime. |

### Layout

| Composable | Purpose |
|---|---|
| `useVirtualScroll` | Windowed rendering for large datasets. Renders only visible rows + buffer. Supports lazy loading, scroll-to-index, and debounced scroll events. |
| `useTableExpansion` | Expandable rows with O(1) key-based lookup. Toggle, expand-all, collapse-all. |
| `useTableRowGrouping` | Groups rows by field and inserts group header rows. |
| `useMobileCardLayout` | Mobile card view layout logic for responsive table display. |

## Usage

These composables are consumed internally by VcDataTable. If you need to interact with them, use VcDataTable's props and events:

```vue
<VcDataTable
  :items="items"
  state-key="my-table"
  sort-field="name"
  :sort-order="1"
  removable-sort
  resizable-columns
  reorderable-columns
  :virtual-scroll="true"
  :virtual-scroll-item-size="48"
  edit-mode="cell"
  @sort="onSort"
  @cell-edit-complete="onCellEdit"
  @row:reorder="onReorder"
>
  <VcColumn field="name" header="Name" sortable :filter="true" />
  <VcColumn field="status" header="Status" :filter="{ options: statusOptions }" />
</VcDataTable>
```

### Registering custom cell types

```typescript
import { useCellRegistry } from "@vc-shell/framework";

const { register } = useCellRegistry();
register({
  type: "rating",
  component: CellRating,
  config: { editable: false },
});
```

## Tips

- `useTableColumns` never removes entries from `columnWidths` -- hidden columns preserve their width/order for when they reappear.
- `useTableRowReorder`: `event.preventDefault()` in `dragover` MUST be called on every event or `drop` never fires.
- `useTableColumnsResize` pins all columns to fixed widths during drag to prevent flex redistribution, then unpins on mouseup.
- `useDataTableState` guards against save-during-restore loops with an `isRestoring` flag.
- `useVirtualScroll` requires a fixed `itemSize` (row height in pixels) for accurate positioning.

## Related

- `framework/ui/components/organisms/vc-table/VcDataTable.vue` -- main consumer
- `framework/ui/components/organisms/vc-table/VcTableAdapter.vue` -- legacy API adapter
- `framework/ui/components/organisms/vc-table/components/` -- sub-components (TableHead, TableRow, cells)
