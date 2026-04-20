# VcTable Composables

Composables that power VcDataTable's functionality. Each handles a single concern and is wired together by the table component. Module developers rarely use these directly -- they are consumed internally by `VcDataTable.vue`.

## Overview

The composables follow a PrimeVue-inspired pattern: each returns reactive state and handler functions that the table component binds to its template. They communicate via shared refs passed through options objects.

## Composable Catalog

### Data & State

| Composable | Purpose |
|---|---|
| `useDataTableState` | Persists column state (v2 schema: weights, order, hidden/shown IDs) to localStorage/sessionStorage. Auto-migrates v1 (pixel-based) state on first load. Key format: `VC_DATATABLE_{KEY}`. Debounced auto-save (150ms) with restore-on-mount. |
| `useTableColumns` | Column ordering, width management via `columnState` (weight store), computed pixel widths via `engineOutput`. Exposes `recompute()` to trigger a recalculation pass. Watches `visibleColumns` and appends new columns without dropping hidden ones. |
| `useColumnWidthEngine` | Pure functions for deterministic column width computation (see below). |
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
| `useTableColumnsResize` | Weight-based resize: dragging adjusts the weights of the dragged column and its right neighbor without touching other columns. DOM-based px updates during drag for smooth 60fps; commits new weights to `columnState` on mouseup. No `ResizeObserver` scaling. |
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

## useColumnWidthEngine

`useColumnWidthEngine` is a collection of **pure functions** (no reactive state) for deterministic column width computation. `useTableColumns` calls these internally on every render pass and on container resize.

### Core functions

#### `computeColumnWidths(input: EngineInput): EngineOutput`

The central engine. Distributes `availableWidth` among visible columns according to their current weights, enforcing `minWidth` / `maxWidth` constraints.

```ts
interface EngineInput {
  visibleIds: string[];                          // Ordered list of visible column IDs
  specs: Record<string, ColumnSpec>;            // Per-column: weight, minWidth, maxWidth
  availableWidth: number;                        // Container width in px
  fitMode: "gap" | "fit";                       // "gap" leaves filler space, "fit" fills width
}

interface EngineOutput {
  widths: Record<string, number>;               // Computed px width per column ID
  totalWidth: number;                            // Sum of all computed widths
  overflow: boolean;                             // true when sum(minWidth) > availableWidth
}
```

In crisis (`overflow: true`), each column receives its `minWidth` regardless of weight, and a console warning is emitted.

#### `parseColumnWidth(value: string | number | undefined, availableWidth: number): ParsedWidth`

Parses a `VcColumn` `width` prop into a concrete pixel value.

```ts
type ParsedWidth =
  | { type: "px";   value: number }   // "200", 200, "200px"
  | { type: "pct";  value: number }   // "20%" → 0.2 * availableWidth
  | { type: "auto"; value: undefined } // undefined, "auto"
```

#### `buildInitialWeights(parsed: ParsedWidth[], availableWidth: number): Record<string, number>`

Converts an array of `ParsedWidth` values (one per column) into initial weights. Auto columns receive an equal share of the space not claimed by px/% columns.

```ts
// Example: three columns — 200px, 20%, auto — with 800px available
// px-column  → weight 200
// pct-column → weight 160  (20% of 800)
// auto-column→ weight 440  (800 - 200 - 160)
```

#### `normalizeWeights(specs: Record<string, ColumnSpec>, visibleIds: string[]): void`

Mutates `specs` in place so that the weights of `visibleIds` sum to 1.0. Called before a `"fit"` mode computation pass.

### When weights update

| User action | Weight change |
|-------------|--------------|
| Column resize (drag border) | Dragged column and right neighbor exchange weight proportionally |
| Column show/hide | Hidden column's weight is preserved; shown column uses saved or initial weight |
| Reset columns | All weights rebuilt from declarative `width` props |
| Container resize | Weights unchanged; engine recomputes px widths from same weights × new `availableWidth` |

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

- `useTableColumns` never removes entries from `columnState` — hidden columns preserve their weight and order for when they reappear. Use `engineOutput` (not `columnState` directly) to read computed pixel widths for rendering.
- Call `recompute()` (returned by `useTableColumns`) whenever the container width changes to force the engine to redistribute widths without altering weights.
- `useDataTableState` stores the v2 schema (weights, order, hidden/shown IDs). It automatically migrates v1 state (pixel-based) on the first restore. Guard against save-during-restore loops with the `isRestoring` flag.
- `useColumnWidthEngine` functions are pure — pass immutable copies of `specs` when testing or previewing layouts without committing to state.
- `useTableRowReorder`: `event.preventDefault()` in `dragover` MUST be called on every event or `drop` never fires.
- `useTableColumnsResize` applies DOM-level px changes during drag for 60fps performance, then commits final weights to `columnState` on mouseup. No `ResizeObserver` scaling is involved.
- `useVirtualScroll` requires a fixed `itemSize` (row height in pixels) for accurate positioning.

## Related

- `framework/ui/components/organisms/vc-table/VcDataTable.vue` -- main consumer
- `framework/ui/components/organisms/vc-table/VcTableAdapter.vue` -- legacy API adapter
- `framework/ui/components/organisms/vc-table/components/` -- sub-components (TableHead, TableRow, cells)
