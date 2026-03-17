# VcDataTable

A feature-rich declarative data table built on Vue 3 Composition API. Columns are defined as `VcColumn` child components, giving you a template-driven API for sorting, selection, inline editing, filtering, column management, row reorder, pagination, and more.

## When to Use

- Display tabular data with interactive features (sort, filter, select, edit).
- Need column resize, reorder, or a column visibility switcher.
- Require inline cell or row editing with validation.
- Building a list blade with pagination or infinite scroll.
- When NOT to use: for simple key-value display, use a description list or `VcCard`. For tree/hierarchical data, consider a custom component.

## Basic Usage

```vue
<template>
  <VcDataTable :items="products">
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="price" field="price" title="Price" type="money" />
    <VcColumn id="stock" field="stock" title="Stock" type="number" />
    <VcColumn id="status" field="status" title="Status" />
  </VcDataTable>
</template>

<script setup lang="ts">
import { VcDataTable, VcColumn } from "@vc-shell/framework";

const products = ref([
  { id: 1, name: "Laptop", price: 1299.99, currency: "USD", stock: 45, status: "In Stock" },
]);
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | Data items to display. |
| `dataKey` | `string` | `"id"` | Unique row identifier field. |
| `loading` | `boolean` | `false` | Show loading overlay. |
| `selectionMode` | `"single" \| "multiple"` | -- | Row selection mode. |
| `editMode` | `"cell" \| "row" \| "inline"` | -- | Inline editing mode. |
| `sortField` | `string` | -- | Currently sorted field (v-model). |
| `sortOrder` | `1 \| -1 \| 0` | `0` | Sort direction (v-model). |
| `removableSort` | `boolean` | `false` | Allow 3-state sort cycle (asc/desc/none). |
| `pagination` | `DataTablePagination` | -- | Pagination config; omit to hide. |
| `searchable` | `boolean` | `false` | Show search bar above the table. |
| `columnSwitcher` | `boolean \| "auto" \| "defined"` | `true` | Column visibility toggle panel. |
| `reorderableRows` | `boolean` | `false` | Enable row drag-and-drop reorder. |
| `rowActions` | `(item: T) => TableAction[]` | -- | Per-row action buttons/menu. |
| `globalFilters` | `GlobalFilterConfig[]` | -- | Global filter panel config. |
| `stateKey` | `string` | -- | Key for persisting column widths, order, sort, filters. |

## Sorting

Columns opt in to sorting with the `sortable` prop. Listen to the `@sort` event for backend sorting or use `v-model:sortField` / `v-model:sortOrder`.

```vue
<VcDataTable
  :items="products"
  v-model:sort-field="sortField"
  v-model:sort-order="sortOrder"
  :removable-sort="true"
  @sort="handleSort"
>
  <VcColumn id="name" field="name" title="Name" sortable />
  <VcColumn id="price" field="price" title="Price" type="money" sortable />
</VcDataTable>
```

**Multi-column sort:** Set `sort-mode="multiple"` and bind `v-model:multi-sort-meta`.

## Selection

Use `v-model:selection` with `selection-mode` to enable row selection. Checkboxes appear automatically in `"multiple"` mode.

```vue
<VcDataTable
  :items="products"
  v-model:selection="selected"
  selection-mode="multiple"
  :is-row-selectable="(item) => item.stock > 0"
>
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

The `is-row-selectable` callback disables selection for specific rows. A "Select All" banner appears when all visible rows are checked, with an option to extend selection to all pages via the `@select-all` event.

## Inline Editing

Three edit modes are available:

**Cell editing** -- click a cell to edit it inline:

```vue
<VcDataTable :items="products" edit-mode="cell" @cell-edit-complete="onCellSave">
  <VcColumn id="name" field="name" title="Name" editable />
  <VcColumn id="price" field="price" title="Price" type="money" editable />
</VcDataTable>
```

**Row editing** -- edit/save/cancel per row with a dedicated column:

```vue
<VcDataTable :items="products" edit-mode="row" @row-edit-save="onRowSave">
  <VcColumn id="name" field="name" title="Name" editable />
  <VcColumn id="actions" :row-editor="true" title="" :width="80" />
</VcDataTable>
```

**Bulk inline editing** -- all editable cells are active at once. Use the `addRow` prop to enable an "Add Row" button and `@edit-save` for batch commit:

```vue
<VcDataTable
  :items="products"
  edit-mode="inline"
  :add-row="{ enabled: true, position: 'header' }"
  :validation-rules="{ name: (v) => v ? true : 'Required' }"
  @edit-save="onBulkSave"
/>
```

## Column Management

### Resize

Columns are resizable by default (`resizable-columns`). Drag the column border in the header to resize. Widths are persisted when `stateKey` is set.

### Reorder

Columns are reorderable by default (`reorderable-columns`). Drag a column header to a new position. Order is persisted via `stateKey`.

### Column Switcher

When `column-switcher` is truthy, a toggle button appears in the toolbar. Users can show/hide columns from a dropdown panel.

```vue
<VcDataTable :items="products" column-switcher="defined">
  <VcColumn id="name" field="name" title="Name" />
  <VcColumn id="internal" field="sku" title="SKU" :visible="false" />
</VcDataTable>
```

## Filtering

### Column Filters

Add `filter` to a VcColumn to render a filter control in the column header:

```vue
<VcColumn id="status" field="status" title="Status"
  :filter="{ options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] }"
/>
<VcColumn id="created" field="createdDate" title="Created"
  :filter="{ range: ['startDate', 'endDate'] }"
/>
```

### Global Filters

Use the `global-filters` prop for filters not tied to a specific column:

```vue
<VcDataTable
  :items="products"
  :global-filters="[
    { id: 'category', label: 'Category', filter: { options: categoryOptions } },
  ]"
  @filter="handleFilter"
/>
```

## Row Actions

Per-row action buttons are rendered on hover (inline mode) or via a dropdown menu:

```vue
<VcDataTable
  :items="products"
  :row-actions="(item) => [
    { id: 'edit', title: 'Edit', icon: 'lucide-pencil', clickHandler: () => edit(item) },
    { id: 'delete', title: 'Delete', icon: 'lucide-trash-2', variant: 'danger' },
  ]"
  row-actions-mode="inline"
  @row-action="onAction"
/>
```

Set `row-actions-position="column"` for a fixed actions column instead of overlay.

## Row Reorder

Enable drag-and-drop row reordering:

```vue
<VcDataTable :items="products" :reorderable-rows="true" @row-reorder="onReorder">
  <VcColumn id="drag" :row-reorder="true" :width="40" />
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

## Expandable Rows

```vue
<VcDataTable :items="products" v-model:expanded-rows="expanded">
  <VcColumn id="expand" :expander="true" :width="40" />
  <VcColumn id="name" field="name" title="Name" />

  <template #expansion="{ data }">
    <div>Details for {{ data.name }}</div>
  </template>
</VcDataTable>
```

## Row Grouping

Group rows by a field with optional collapsible subheaders:

```vue
<VcDataTable
  :items="products"
  group-rows-by="category"
  :expandable-row-groups="true"
>
  <VcColumn id="name" field="name" title="Name" />
  <template #groupheader="{ data }">
    <strong>{{ data.category }}</strong>
  </template>
</VcDataTable>
```

## Search

```vue
<VcDataTable
  :items="products"
  searchable
  v-model:search-value="query"
  search-placeholder="Search products..."
  :search-debounce="300"
  @search="fetchFiltered"
/>
```

## Pagination and Infinite Scroll

```vue
<!-- Pagination -->
<VcDataTable
  :items="products"
  :pagination="{ currentPage: page, pages: totalPages }"
  @pagination-click="page = $event"
/>

<!-- Infinite Scroll -->
<VcDataTable
  :items="products"
  :infinite-scroll="true"
  :infinite-scroll-distance="150"
  @load-more="loadNextPage"
/>
```

## State Persistence

Set `state-key` to persist column widths, column order, hidden columns, sort, and filters to localStorage (or sessionStorage with `state-storage="session"`):

```vue
<VcDataTable :items="products" state-key="product-list" />
```

Storage key format: `VC_DATATABLE_PRODUCT-LIST`.

## Mobile Card View

On mobile, VcDataTable automatically switches to a card layout. Control column placement with `mobileRole`:

```vue
<VcColumn id="image" field="imgSrc" type="image" mobile-role="image" />
<VcColumn id="name" field="name" title="Name" mobile-role="title" />
<VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
<VcColumn id="status" field="status" title="Status" mobile-role="status" />
```

Roles: `"title"` (bold heading), `"image"` (left thumbnail), `"field"` (label+value in 2x2 grid, max 4), `"status"` (badge row at bottom).

## Empty and Not-Found States

```vue
<VcDataTable
  :items="products"
  :empty-state="{ icon: 'lucide-package-open', title: 'No products yet', actionLabel: 'Add Product', actionHandler: addProduct }"
  :not-found-state="{ icon: 'lucide-search-x', title: 'No results found' }"
/>
```

Or use slots for full custom rendering: `#empty` and `#not-found`.

## VcColumn API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | *required* | Unique column identifier. |
| `field` | `string` | same as `id` | Data field path on each item. |
| `title` | `string` | -- | Header text. |
| `type` | `VcColumnCellType` | `"text"` | Cell formatter: `"text"`, `"number"`, `"money"`, `"date"`, `"datetime"`, `"image"`, `"link"`, `"status"`, etc. |
| `width` | `string \| number` | -- | Column width in px or CSS value. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Cell text alignment. |
| `sortable` | `boolean` | `false` | Enable sorting on this column. |
| `editable` | `boolean` | `false` | Enable inline editing. |
| `filter` | `ColumnFilterConfig` | -- | Filter config: `true` (text), object (select/dateRange). |
| `visible` | `boolean` | `true` | Initial visibility (toggled via column switcher). |
| `alwaysVisible` | `boolean` | `false` | Stay visible when blade narrows (`showAllColumns=false`). |
| `selectionMode` | `"single" \| "multiple"` | -- | Renders a selection checkbox column. |
| `expander` | `boolean` | `false` | Renders expand/collapse toggle. |
| `rowReorder` | `boolean` | `false` | Renders drag handle for row reorder. |
| `rowEditor` | `boolean` | `false` | Renders save/cancel buttons for row edit mode. |
| `mobileRole` | `"title" \| "image" \| "field" \| "status"` | -- | Role in mobile card layout. |

**VcColumn Slots:** `#body="{ data, field, index }"`, `#editor="{ data, field, index, editorCallback }"`, `#header="{ column }"`, `#filter="{ field, value, applyFilter, clearFilter }"`.

## Accessibility

- Table root has `aria-busy` when loading.
- Selection checkboxes use native `<input type="checkbox">` with labels.
- Sort indicators are announced via `aria-sort` on column headers.
- Keyboard navigation: Tab through interactive cells; Enter/Escape to commit/cancel edits.
- Empty state provides a descriptive message for screen readers.

## Related Components

- **VcTableAdapter** -- legacy `VcTable` API wrapper around VcDataTable (exported as `VcTable`).
- **VcColumn** -- declarative column definition (must be a direct child of VcDataTable).
- **TableColumnSwitcher** -- standalone column visibility panel (built into VcDataTable).
- **VcPagination** -- pagination molecule used internally when `pagination` prop is set.
