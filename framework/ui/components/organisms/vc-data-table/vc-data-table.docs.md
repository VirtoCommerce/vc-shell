# VcDataTable

The flagship data table component for VirtoCommerce admin shell. VcDataTable provides a fully declarative, template-driven API for building interactive tables with sorting, selection, inline editing, filtering, pagination, column management, row reordering, and more.

Columns are defined as `<VcColumn>` child components -- no configuration objects, no render functions. Everything lives in the template.

```vue
<VcDataTable :items="products">
  <VcColumn id="name" field="name" title="Name" sortable />
  <VcColumn id="price" field="price" title="Price" type="money" />
</VcDataTable>
```

**Key facts:**

- 82 Storybook stories covering every feature permutation
- Automatic mobile card view on small screens
- State persistence (column widths, order, sort, filters) to localStorage/sessionStorage
- Full TypeScript generics -- `VcDataTable<Product>` propagates types to events and slots

## When to Use

| Scenario | Component |
|----------|-----------|
| Tabular data with sorting, selection, pagination | **VcDataTable** |
| Simple short list without table features | `v-for` with custom markup |
| Image/card grid layout | [VcGallery](../vc-gallery) |
| Key-value detail display | [VcField](../../molecules/vc-field) or [VcCard](../../atoms/vc-card) |

Use VcDataTable whenever you need structured rows and columns with any combination of sorting, filtering, inline editing, or column management. **Do not use** VcDataTable for simple lists of 5-10 items that need no table features -- a plain `v-for` loop is lighter. For thumbnail/card grids, prefer VcGallery.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Column Types](#column-types)
3. [Sorting](#sorting)
4. [Selection](#selection)
5. [Pagination](#pagination)
6. [Inline Editing](#inline-editing)
7. [Column Management](#column-management)
8. [Row Reorder](#row-reorder)
9. [Expandable Rows](#expandable-rows)
10. [Row Grouping](#row-grouping)
11. [Filters](#filters)
12. [Search Bar](#search-bar)
13. [Infinite Scroll](#infinite-scroll)
14. [State Persistence](#state-persistence)
15. [Row Actions](#row-actions)
16. [Mobile Card View](#mobile-card-view)
17. [Empty and Not-Found States](#empty-and-not-found-states)
18. [Add and Remove Rows](#add-and-remove-rows)
19. [VcColumn API Reference](#vccolumn-api-reference)
20. [VcDataTable Props Reference](#vcdatatable-props-reference)
21. [VcDataTable Events Reference](#vcdatatable-events-reference)
22. [VcDataTable Slots Reference](#vcdatatable-slots-reference)
23. [Recipes](#recipes)
24. [Common Mistakes](#common-mistakes)
25. [Related Components](#related-components)

---

## Quick Start

The simplest possible table -- pass an array and declare columns:

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
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@vc-shell/framework";

const products = ref([
  { id: "1", name: "Laptop", price: 1299.99, currency: "USD", stock: 45, status: "In Stock" },
  { id: "2", name: "Mouse", price: 49.99, currency: "USD", stock: 120, status: "In Stock" },
  { id: "3", name: "Monitor", price: 599.00, currency: "USD", stock: 0, status: "Out of Stock" },
]);
</script>
```

> **Note:** Each item must have a unique identifier field. The default is `id` -- override with the `data-key` prop if your field is named differently (e.g., `data-key="sku"`).

---

## Column Types

VcColumn's `type` prop controls how cell values are formatted. All types render read-only by default -- add `editable` to enable inline editing.

### Text (default)

```vue
<VcColumn id="name" field="name" title="Name" />
<!-- or explicitly: type="text" -->
```

Renders the raw field value as text. Clamps to 2 lines by default (override with `:line-clamp="0"` for no clamp).

### Money

```vue
<VcColumn id="price" field="price" title="Price" type="money" />
```

Formats as currency. Reads the currency code from each row's `currency` field by default. Override with `currency-field`:

```vue
<VcColumn id="price" field="price" title="Price" type="money" currency-field="priceCurrency" />
```

### Number

```vue
<VcColumn id="stock" field="stock" title="Stock" type="number" />
```

### Date and Time

```vue
<!-- Formatted date -->
<VcColumn id="created" field="createdDate" title="Created" type="datetime" />

<!-- Relative time ("3 hours ago") -->
<VcColumn id="modified" field="modifiedDate" title="Modified" type="date-ago" />

<!-- Date only -->
<VcColumn id="birthday" field="birthDate" title="Birthday" type="date" format="DD.MM.YYYY" />

<!-- Time only -->
<VcColumn id="time" field="startTime" title="Start" type="time" />
```

### Image

```vue
<VcColumn id="thumbnail" field="imgSrc" title="Image" type="image" :width="60" />
```

Renders a small thumbnail from the field's URL value.

### Link

```vue
<VcColumn id="url" field="websiteUrl" title="Website" type="link" />
```

Renders as a clickable anchor tag.

### HTML

```vue
<VcColumn id="description" field="descriptionHtml" title="Description" type="html" />
```

Renders raw HTML inside the cell. Use with caution -- ensure content is sanitized.

### Status Icon

```vue
<VcColumn id="status" field="isActive" title="Active" type="status-icon" />
```

Renders a colored status dot based on the field value.

### Custom Cell (via slot)

For any rendering not covered by built-in types, use the `#body` slot:

```vue
<VcColumn id="name" field="name" title="Product">
  <template #body="{ data }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <img :src="data.imgSrc" class="tw-w-8 tw-h-8 tw-rounded" />
      <span class="tw-font-semibold">{{ data.name }}</span>
    </div>
  </template>
</VcColumn>
```

---

## Sorting

### Single Column Sort

Mark columns as sortable and bind the sort state:

```vue
<template>
  <VcDataTable
    :items="products"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    @sort="handleSort"
  >
    <VcColumn id="name" field="name" title="Name" sortable />
    <VcColumn id="price" field="price" title="Price" type="money" sortable />
    <VcColumn id="stock" field="stock" title="Stock" type="number" />
  </VcDataTable>
</template>

<script setup lang="ts">
const sortField = ref("name");
const sortOrder = ref<1 | -1 | 0>(1);

function handleSort(event: { sortField?: string; sortOrder?: number }) {
  // Fetch sorted data from backend
  fetchProducts({ sort: `${event.sortField}:${event.sortOrder === 1 ? "ASC" : "DESC"}` });
}
</script>
```

Clicking a sortable column header cycles: unsorted -> ascending -> descending.

### Removable Sort

Allow users to remove sorting entirely (3-state cycle: asc -> desc -> none):

```vue
<VcDataTable :items="products" :removable-sort="true">
  <VcColumn id="name" field="name" title="Name" sortable />
</VcDataTable>
```

### Multi-Column Sort

Hold Shift and click additional columns to sort by multiple fields:

```vue
<VcDataTable
  :items="products"
  sort-mode="multiple"
  v-model:multi-sort-meta="multiSort"
  @sort="handleSort"
>
  <VcColumn id="category" field="category" title="Category" sortable />
  <VcColumn id="name" field="name" title="Name" sortable />
  <VcColumn id="price" field="price" title="Price" type="money" sortable />
</VcDataTable>
```

```ts
const multiSort = ref<SortMeta[]>([]);
// After user clicks: [{ field: "category", order: 1 }, { field: "price", order: -1 }]
```

### Custom Sort Field

When the backend sort field differs from the column id:

```vue
<VcColumn id="productName" field="name" title="Name" sortable sort-field="catalogProduct.name" />
```

---

## Selection

### Multiple Selection (checkboxes)

```vue
<template>
  <VcDataTable
    :items="products"
    v-model:selection="selected"
    selection-mode="multiple"
  >
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="price" field="price" title="Price" type="money" />
  </VcDataTable>

  <p>{{ selected.length }} items selected</p>
</template>

<script setup lang="ts">
const selected = ref<Product[]>([]);
</script>
```

A checkbox column is automatically prepended. A "Select All" banner appears when all visible rows are checked.

### Single Selection (radio)

```vue
<VcDataTable
  :items="products"
  v-model:selection="selectedProduct"
  selection-mode="single"
>
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

### Selection via VcColumn

For explicit control over checkbox column placement:

```vue
<VcDataTable :items="products" v-model:selection="selected">
  <VcColumn id="select" selection-mode="multiple" :width="40" />
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

### Disabling Selection on Specific Rows

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

Out-of-stock rows will have a disabled (grayed-out) checkbox.

### Select All (across pages)

For server-side "select all" that includes items not currently visible:

```vue
<VcDataTable
  :items="products"
  v-model:selection="selected"
  v-model:select-all-active="allSelected"
  selection-mode="multiple"
  :total-count="totalCount"
  @select-all="handleSelectAll"
>
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

```ts
const allSelected = ref(false);

function handleSelectAll(event: { selected: boolean }) {
  if (event.selected) {
    // User wants ALL items selected (not just visible page)
    performBulkAction();
  }
}
```

---

## Pagination

```vue
<template>
  <VcDataTable
    :items="products"
    :pagination="{ currentPage: page, pages: totalPages }"
    :total-count="totalCount"
    @pagination-click="onPageChange"
  >
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="price" field="price" title="Price" type="money" />
  </VcDataTable>
</template>

<script setup lang="ts">
const page = ref(1);
const totalPages = ref(10);
const totalCount = ref(200);

function onPageChange(newPage: number) {
  page.value = newPage;
  fetchProducts({ page: newPage });
}
</script>
```

The pagination bar renders below the table with page numbers, and a "Showing X-Y of Z" counter on the left.

> **Tip:** Omit the `pagination` prop entirely to hide the pagination bar. Use `infinite-scroll` for infinite scrolling instead.

---

## Inline Editing

Three editing modes are available, set via the `edit-mode` prop.

### Cell Editing

Click any editable cell to activate its editor. Press Enter or click away to commit, Escape to cancel.

```vue
<template>
  <VcDataTable :items="products" edit-mode="cell" @cell-edit-complete="onCellSave">
    <VcColumn id="name" field="name" title="Name" editable />
    <VcColumn id="price" field="price" title="Price" type="money" editable />
    <VcColumn id="stock" field="stock" title="Stock" type="number" />
  </VcDataTable>
</template>

<script setup lang="ts">
function onCellSave(event: { data: Product; field: string; newValue: unknown; index: number }) {
  // event.data is the row, event.field is "name" or "price", event.newValue is the new value
  saveProduct(event.data);
}
</script>
```

### Row Editing

A row enters edit mode when the user clicks the edit button. All editable cells in that row become active simultaneously. Add a `rowEditor` column for save/cancel buttons.

```vue
<VcDataTable :items="products" edit-mode="row" @row-edit-save="onRowSave">
  <VcColumn id="name" field="name" title="Name" editable />
  <VcColumn id="price" field="price" title="Price" type="money" editable />
  <VcColumn id="stock" field="stock" title="Stock" type="number" editable />
  <VcColumn id="actions" :row-editor="true" title="" :width="80" />
</VcDataTable>
```

```ts
function onRowSave(event: { data: Product; newData: Product; index: number }) {
  // event.data = original, event.newData = edited copy
  Object.assign(event.data, event.newData);
  saveProduct(event.data);
}
```

### Bulk Inline Editing

All editable cells are active at once -- useful for price lists, inventory grids, or spreadsheet-like UIs.

```vue
<VcDataTable
  :items="products"
  edit-mode="inline"
  :validation-rules="validationRules"
  @edit-save="onBulkSave"
>
  <VcColumn id="name" field="name" title="Name" editable />
  <VcColumn id="price" field="price" title="Price" type="money" editable />
  <VcColumn id="stock" field="stock" title="Stock" type="number" editable />
</VcDataTable>
```

```ts
const validationRules = {
  name: (value: unknown) => (value ? true : "Name is required"),
  price: (value: unknown) => (Number(value) > 0 ? true : "Price must be positive"),
};

function onBulkSave(event: { changes: EditChange<Product>[] }) {
  // changes = [{ data: originalRow, newData: editedRow, index: number }]
  saveAllProducts(event.changes);
}
```

### Custom Editor Slot

For complex editors, use the `#editor` slot:

```vue
<VcColumn id="category" field="category" title="Category" editable>
  <template #editor="{ data, field }">
    <VcSelect v-model="data[field]" :options="categoryOptions" />
  </template>
</VcColumn>
```

---

## Column Management

### Resize

Columns are resizable by default. Drag the right border of any column header to resize. Disable per-table:

```vue
<VcDataTable :items="products" :resizable-columns="false">
  ...
</VcDataTable>
```

Set per-column min/max constraints:

```vue
<VcColumn id="name" field="name" title="Name" :min-width="100" :max-width="400" />
```

### Reorder

Columns are reorderable by default. Drag a column header to a new position. Disable:

```vue
<VcDataTable :items="products" :reorderable-columns="false">
  ...
</VcDataTable>
```

### Column Width Model

VcDataTable uses a **weight-based engine** to compute exact pixel widths for every column deterministically, based on the container's available width.

**How it works:**

1. Developer declares initial widths via the `VcColumn` `width` prop (px, %, or omitted for auto).
2. At runtime, these declarations become proportional weights. The engine converts weights to exact pixel values by distributing `availableWidth` proportionally.
3. When a user resizes a column, only the weights change — the engine recomputes all pixel widths from the new weights on the next render.
4. Clicking **Reset columns** returns all columns to their declarative hints.

**`fitMode` prop** controls what happens to leftover space:

| Value | Behavior |
|-------|----------|
| `"gap"` (default) | A filler pseudo-element absorbs unused space at the right end. |
| `"fit"` | All column weights are normalized so columns fill the entire container width. |

**Width prop contract:**

| Declaration | Meaning |
|-------------|---------|
| `width="200"` or `:width="200"` | Initial 200 px hint |
| `width="20%"` | Initial hint based on 20% of available width |
| `width` omitted | Auto — splits remaining space equally among all auto columns |

After initialization the column lives in the weight model. Container resizes recompute px values without changing weights.

**`minWidth` / `maxWidth`:**

- `minWidth` and `maxWidth` are enforced by the engine on every computation pass.
- Default `minWidth` is 40 px when not specified.
- In crisis (sum of all `minWidth` values exceeds available width), the engine squeezes columns below their minimums and emits a console warning rather than breaking layout.

### Column Switcher

A built-in panel lets users show/hide columns. Enabled by default when `column-switcher` is truthy.

```vue
<!-- Show all declared columns + auto-discovered keys from items -->
<VcDataTable :items="products" column-switcher>
  <VcColumn id="name" field="name" title="Name" />
  <VcColumn id="sku" field="sku" title="SKU" :visible="false" />
</VcDataTable>

<!-- Only show explicitly declared VcColumns (no auto-discovery) -->
<VcDataTable :items="products" column-switcher="defined">
  <VcColumn id="name" field="name" title="Name" />
  <VcColumn id="sku" field="sku" title="SKU" :visible="false" />
</VcDataTable>

<!-- Disable entirely -->
<VcDataTable :items="products" :column-switcher="false">
  ...
</VcDataTable>
```

Columns with `:visible="false"` are hidden initially but can be toggled on by the user via the column switcher.

### Blade-Responsive Columns

When a blade narrows (e.g., a second blade opens), only `alwaysVisible` columns are shown:

```vue
<VcDataTable :items="products" :show-all-columns="!isBladeNarrow">
  <VcColumn id="image" field="imgSrc" type="image" :width="60" :always-visible="true" />
  <VcColumn id="name" field="name" title="Name" :always-visible="true" />
  <VcColumn id="price" field="price" title="Price" type="money" />
  <VcColumn id="stock" field="stock" title="Stock" type="number" />
</VcDataTable>
```

When `show-all-columns` is `false`, only `image` and `name` remain visible.

---

## Row Reorder

Enable drag-and-drop row reordering with a drag handle column:

```vue
<template>
  <VcDataTable
    :items="products"
    :reorderable-rows="true"
    @row-reorder="onReorder"
  >
    <VcColumn id="drag" :row-reorder="true" :width="40" />
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="priority" field="priority" title="Priority" type="number" />
  </VcDataTable>
</template>

<script setup lang="ts">
function onReorder(event: { dragIndex: number; dropIndex: number; value: Product[] }) {
  // event.value is the full array in new order
  products.value = event.value;
  saveSortOrder(event.value);
}
</script>
```

> **Tip:** The drag handle column renders a grip icon. Without `row-reorder` on a VcColumn, the entire row is draggable (less precise, but works).

---

## Expandable Rows

Show additional detail below a row when the user clicks the expand toggle:

```vue
<template>
  <VcDataTable :items="orders" v-model:expanded-rows="expandedRows">
    <VcColumn id="expand" :expander="true" :width="40" />
    <VcColumn id="orderNumber" field="number" title="Order #" />
    <VcColumn id="total" field="total" title="Total" type="money" />

    <template #expansion="{ data }">
      <div class="tw-p-4">
        <h4 class="tw-font-semibold tw-mb-2">Order Items</h4>
        <ul>
          <li v-for="item in data.lineItems" :key="item.id">
            {{ item.name }} x{{ item.quantity }} -- {{ item.price }}
          </li>
        </ul>
      </div>
    </template>
  </VcDataTable>
</template>

<script setup lang="ts">
const expandedRows = ref<Order[]>([]);
</script>
```

Customize expand/collapse icons:

```vue
<VcDataTable
  :items="orders"
  v-model:expanded-rows="expandedRows"
  expanded-row-icon="lucide-minus-circle"
  collapsed-row-icon="lucide-plus-circle"
>
  ...
</VcDataTable>
```

### Conditional expansion

Use `isRowExpandable` to control which rows show the expand toggle. Rows that fail the predicate cannot be expanded:

```vue
<template>
  <VcDataTable
    :items="orders"
    v-model:expanded-rows="expandedRows"
    :is-row-expandable="(order) => order.lineItems.length > 0"
  >
    <VcColumn id="expand" :expander="true" :width="40" />
    <VcColumn id="orderNumber" field="number" title="Order #" />

    <template #expansion="{ data }">
      <div class="tw-p-4">
        <p v-for="item in data.lineItems" :key="item.id">{{ item.name }}</p>
      </div>
    </template>
  </VcDataTable>
</template>

<script setup lang="ts">
const expandedRows = ref<Order[]>([]);
</script>
```

---

## Row Grouping

Group rows by a field value. Each group gets a subheader row.

```vue
<template>
  <VcDataTable
    :items="products"
    group-rows-by="category"
    :expandable-row-groups="true"
    v-model:expanded-row-groups="expandedGroups"
  >
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="price" field="price" title="Price" type="money" />

    <template #groupheader="{ data }">
      <strong>{{ data.category }}</strong> ({{ getCategoryCount(data.category) }} items)
    </template>

    <template #groupfooter="{ data }">
      <em>Subtotal: {{ getCategorySubtotal(data.category) }}</em>
    </template>
  </VcDataTable>
</template>

<script setup lang="ts">
const expandedGroups = ref<string[]>([]);
</script>
```

Set `:expandable-row-groups="false"` to show all groups expanded without collapse controls.

---

## Filters

### Declarative Column Filters

Add the `filter` prop to a VcColumn to render a filter control in its header.

**Text filter** -- simple text input:

```vue
<VcColumn id="name" field="name" title="Name" :filter="true" />

<!-- With custom backend field -->
<VcColumn id="name" field="name" title="Name" filter="catalogProduct.name" />
```

**Select filter** -- dropdown with predefined options:

```vue
<VcColumn
  id="status"
  field="status"
  title="Status"
  :filter="{
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ],
  }"
/>

<!-- Multi-select -->
<VcColumn
  id="tags"
  field="tags"
  title="Tags"
  :filter="{
    options: tagOptions,
    multiple: true,
  }"
/>
```

**Date range filter** -- start/end date pickers:

```vue
<VcColumn
  id="createdDate"
  field="createdDate"
  title="Created"
  type="datetime"
  :filter="{ range: ['startDate', 'endDate'] }"
/>
```

The `range` tuple specifies the two backend field names emitted in the `@filter` event payload.

### Listening to Filter Changes

```vue
<VcDataTable :items="products" @filter="handleFilter">
  <VcColumn id="status" field="status" title="Status" :filter="{ options: statusOptions }" />
  <VcColumn id="created" field="createdDate" title="Created" :filter="{ range: ['startDate', 'endDate'] }" />
</VcDataTable>
```

```ts
function handleFilter(event: { filters: Record<string, unknown> }) {
  // event.filters = { status: "active", startDate: "2025-01-01", endDate: "2025-12-31" }
  fetchProducts(event.filters);
}
```

### Custom Filter Template

For filter UI not covered by built-in types, use the `#filter` slot on VcColumn:

```vue
<VcColumn id="price" field="price" title="Price" :filter="true">
  <template #filter="{ value, updateValue, applyFilter, clearFilter }">
    <div class="tw-flex tw-gap-2">
      <input type="number" :value="value" @input="updateValue($event.target.value)" placeholder="Max price" />
      <button @click="applyFilter">Apply</button>
      <button @click="clearFilter">Clear</button>
    </div>
  </template>
</VcColumn>
```

### Global Filters

Filters not tied to a specific column -- displayed in a separate filter panel:

```vue
<VcDataTable
  :items="products"
  :global-filters="[
    {
      id: 'category',
      label: 'Category',
      filter: {
        options: [
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
        ],
        multiple: true,
      },
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      filter: { range: ['fromDate', 'toDate'] },
    },
  ]"
  @filter="handleFilter"
>
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

A filter icon button appears in the toolbar. Clicking it opens the global filter panel.

### Combining Column and Global Filters

Column filters and global filters work together. The `@filter` event merges all active filter values into a single flat object:

```vue
<VcDataTable
  :items="products"
  :global-filters="globalFilters"
  @filter="handleFilter"
>
  <VcColumn id="name" field="name" title="Name" :filter="true" />
  <VcColumn id="status" field="status" title="Status" :filter="{ options: statusOptions }" />
</VcDataTable>
```

```ts
function handleFilter(event: { filters: Record<string, unknown> }) {
  // Merged: { name: "laptop", status: "active", category: ["electronics"] }
  fetchProducts(event.filters);
}
```

---

## Search Bar

```vue
<VcDataTable
  :items="products"
  searchable
  v-model:search-value="searchQuery"
  search-placeholder="Search products..."
  :search-debounce="300"
  @search="onSearch"
>
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

```ts
const searchQuery = ref("");

function onSearch(value: string) {
  // Debounced -- fires 300ms after user stops typing
  fetchProducts({ keyword: value });
}
```

The search bar appears above the table. When `global-filters` are also set, the filter button renders beside the search input.

---

## Infinite Scroll

Load more data as the user scrolls down:

```vue
<template>
  <VcDataTable
    :items="products"
    :infinite-scroll="true"
    :infinite-scroll-distance="150"
    :loading="loadingMore"
    scroll-height="500px"
    @load-more="loadNextPage"
  >
    <VcColumn id="name" field="name" title="Name" />
    <VcColumn id="price" field="price" title="Price" type="money" />
  </VcDataTable>
</template>

<script setup lang="ts">
const page = ref(1);
const loadingMore = ref(false);

async function loadNextPage() {
  loadingMore.value = true;
  const nextProducts = await fetchProducts({ page: ++page.value });
  products.value.push(...nextProducts);
  loadingMore.value = false;
}
</script>
```

> **Note:** Set `scroll-height` to give the table a fixed height. Without it, the table grows to fit all items and the scroll event never fires.

---

## State Persistence

Persist column widths, column order, hidden columns, sort, and filters across page reloads:

```vue
<VcDataTable
  :items="products"
  state-key="product-list"
>
  <VcColumn id="name" field="name" title="Name" sortable />
  <VcColumn id="price" field="price" title="Price" type="money" sortable />
</VcDataTable>
```

**Storage key format:** `VC_DATATABLE_PRODUCT-LIST` (uppercased `state-key`).

**Schema version:** The persisted state uses the **v2 schema**, which stores column weights, column order, and hidden/shown column IDs. `containerWidth` is no longer stored because weights are container-independent — the engine recomputes pixel values from weights on every mount.

If an older browser tab wrote **v1** state (pixel-based widths), it is automatically migrated to v2 on first load. No manual migration is needed.

Use sessionStorage instead of localStorage:

```vue
<VcDataTable :items="products" state-key="product-list" state-storage="session">
  ...
</VcDataTable>
```

Listen to state events:

```vue
<VcDataTable
  :items="products"
  state-key="product-list"
  @state-save="onStateSave"
  @state-restore="onStateRestore"
>
  ...
</VcDataTable>
```

> **Tip:** Each table in your application should have a unique `state-key`. If two tables share the same key, they will overwrite each other's persisted state.

---

## Row Actions

Per-row action buttons that appear on hover or in a dropdown menu.

### Inline Actions (default)

Quick action buttons appear on the right side of the row on hover. Extra actions overflow into a dropdown.

```vue
<VcDataTable
  :items="products"
  :row-actions="getActions"
  row-actions-mode="inline"
  :max-quick-actions="3"
  @row-action="onAction"
>
  <VcColumn id="name" field="name" title="Name" />
  <VcColumn id="price" field="price" title="Price" type="money" />
</VcDataTable>
```

```ts
function getActions(item: Product): TableAction[] {
  return [
    { id: "edit", title: "Edit", icon: "lucide-pencil", clickHandler: () => editProduct(item) },
    { id: "duplicate", title: "Duplicate", icon: "lucide-copy" },
    { id: "archive", title: "Archive", icon: "lucide-archive" },
    { id: "delete", title: "Delete", icon: "lucide-trash-2", variant: "danger" },
  ];
}

function onAction(event: { action: TableAction; item: Product; index: number }) {
  // Handle actions without clickHandler, or for centralized handling
}
```

### Dropdown Actions

All actions in a three-dot dropdown menu:

```vue
<VcDataTable
  :items="products"
  :row-actions="getActions"
  row-actions-mode="dropdown"
>
  ...
</VcDataTable>
```

### Fixed Actions Column

Render actions in a dedicated column (always visible, not overlay):

```vue
<VcDataTable
  :items="products"
  :row-actions="getActions"
  row-actions-position="column"
>
  ...
</VcDataTable>
```

### Conditional Actions

```ts
function getActions(item: Product): TableAction[] {
  return [
    { id: "edit", title: "Edit", icon: "lucide-pencil" },
    { id: "publish", title: "Publish", icon: "lucide-globe", hidden: item.status === "published" },
    { id: "delete", title: "Delete", icon: "lucide-trash-2", variant: "danger", disabled: item.isProtected },
  ];
}
```

---

## Mobile Card View

On mobile screens, VcDataTable automatically switches from a table to a card layout. Control how columns map to card regions with `mobile-role`:

```vue
<VcDataTable :items="products">
  <VcColumn id="image" field="imgSrc" type="image" mobile-role="image" :width="60" />
  <VcColumn id="name" field="name" title="Name" mobile-role="title" />
  <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
  <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
  <VcColumn id="sku" field="sku" title="SKU" mobile-role="field" />
  <VcColumn id="weight" field="weight" title="Weight" mobile-role="field" />
  <VcColumn id="status" field="status" title="Status" mobile-role="status" />
</VcDataTable>
```

**Mobile roles:**

| Role | Description | Max count |
|------|-------------|-----------|
| `"title"` | Bold heading at the top of the card | 1 |
| `"image"` | Thumbnail on the left side | 1 |
| `"field"` | Label + value pair in a 2x2 grid | 4 |
| `"status"` | Badge/chip at the bottom | Multiple |

### Pull-to-Refresh (mobile)

```vue
<VcDataTable
  :items="products"
  :pull-to-refresh="true"
  :pull-to-refresh-text="{ pull: 'Pull down', release: 'Release to refresh', refreshing: 'Loading...' }"
  @pull-refresh="reload"
>
  ...
</VcDataTable>
```

### Mobile Swipe Actions

Row actions defined via the `row-actions` prop automatically appear as swipe actions on mobile cards.

---

## Empty and Not-Found States

### Via Props

```vue
<VcDataTable
  :items="products"
  :empty-state="{
    icon: 'lucide-package-open',
    title: 'No products yet',
    description: 'Add your first product to get started.',
    actionLabel: 'Add Product',
    actionHandler: () => openAddProductBlade(),
  }"
  :not-found-state="{
    icon: 'lucide-search-x',
    title: 'No results found',
    description: 'Try different search terms or clear filters.',
    actionLabel: 'Clear Search',
    actionHandler: () => clearSearch(),
  }"
>
  ...
</VcDataTable>
```

- **Empty state** shows when `items` is empty and no search/filters are active.
- **Not-found state** shows when `items` is empty AND a search query or filters are active.

### Via Slots (full customization)

```vue
<VcDataTable :items="products" searchable>
  <VcColumn id="name" field="name" title="Name" />

  <template #empty>
    <div class="tw-text-center tw-py-12">
      <img src="/empty-illustration.svg" class="tw-mx-auto tw-mb-4" />
      <h3>Your store is empty</h3>
      <VcButton @click="addProduct">Add First Product</VcButton>
    </div>
  </template>

  <template #not-found>
    <div class="tw-text-center tw-py-12">
      <p>Nothing matched your search.</p>
    </div>
  </template>
</VcDataTable>
```

---

## Add and Remove Rows

For inline editing mode, enable adding/removing rows directly in the table:

```vue
<template>
  <VcDataTable
    :items="products"
    edit-mode="inline"
    :add-row="{ enabled: true, position: 'header', label: 'Add Product', icon: 'lucide-plus' }"
    @row-add="onRowAdd"
    @row-remove="onRowRemove"
    @edit-save="onBulkSave"
  >
    <VcColumn id="name" field="name" title="Name" editable />
    <VcColumn id="price" field="price" title="Price" type="money" editable />
    <VcColumn id="stock" field="stock" title="Stock" type="number" editable />
  </VcDataTable>
</template>

<script setup lang="ts">
function onRowAdd(event: { defaults: Record<string, unknown>; cancel: () => void }) {
  // Optionally set default values for the new row
  event.defaults.price = 0;
  event.defaults.stock = 1;
  // Call event.cancel() to prevent the row from being added
}

function onRowRemove(event: { data: Product; index: number; cancel: () => void }) {
  if (event.data.isProtected) {
    event.cancel(); // Prevent deletion
  }
}
</script>
```

**Add button positions:**

| Position | Description |
|----------|-------------|
| `"header"` | Above the table body |
| `"footer"` | Below the table body |
| `"none"` | No built-in button (trigger via external button or slot) |

---

## VcColumn API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **required** | Unique column identifier. Must be unique within the table. |
| `field` | `string` | same as `id` | Data field path to read from each row item. |
| `title` | `string` | -- | Header text displayed in the column header. |
| `type` | `CellType` | `"text"` | Cell formatter: `"text"`, `"number"`, `"money"`, `"date"`, `"datetime"`, `"date-ago"`, `"time"`, `"image"`, `"link"`, `"html"`, `"status"`, `"status-icon"`. |
| `currencyField` | `string` | `"currency"` | Field to read currency code from (for `type="money"`). |
| `format` | `string` | -- | Date/number format string (e.g. `"DD.MM.YYYY"`). |
| `width` | `string \| number` | -- | Column width in px or CSS value (e.g. `200`, `"150px"`). |
| `minWidth` | `string \| number` | `60` | Minimum column width during resize. |
| `maxWidth` | `string \| number` | -- | Maximum column width during resize. |
| `align` | `"start" \| "center" \| "end"` | -- | Cell text alignment. |
| `headerAlign` | `"start" \| "center" \| "end"` | same as `align` | Header text alignment. |
| `sortable` | `boolean` | `false` | Enable sorting on this column. |
| `sortField` | `string` | same as `id` | Backend field name used in sort events. |
| `filter` | `ColumnFilterConfig` | -- | Filter config: `true` (text), `"field"` (text with custom field), `{ options }` (select), `{ range }` (date range). |
| `filterField` | `string` | same as `id` | Backend field name used in filter events. |
| `filterPlaceholder` | `string` | -- | Placeholder text for the filter input. |
| `visible` | `boolean` | `true` | Initial visibility. Hidden columns can be toggled via column switcher. |
| `alwaysVisible` | `boolean` | `false` | Keep visible when `showAllColumns=false` (blade narrows). |
| `editable` | `boolean` | `false` | Enable inline editing for this column's cells. |
| `rules` | `Record<string, unknown>` | -- | Validation rules for the editable cell. |
| `class` | `string` | -- | CSS class applied to header and body cells. |
| `headerClass` | `string` | -- | CSS class applied only to the header cell. |
| `bodyClass` | `string` | -- | CSS class applied only to body cells. |
| `lineClamp` | `number` | `2` | Max lines to display before truncating. `0` = no clamp. |
| `selectionMode` | `"single" \| "multiple"` | -- | Renders a selection checkbox/radio column. |
| `rowEditor` | `boolean` | `false` | Renders save/cancel buttons for row edit mode. |
| `rowReorder` | `boolean` | `false` | Renders a drag handle for row reordering. |
| `expander` | `boolean` | `false` | Renders an expand/collapse toggle. |
| `mobileRole` | `"title" \| "image" \| "field" \| "status"` | -- | Role in mobile card layout. |
| `mobileVisible` | `boolean` | `false` | Whether column is visible on mobile (hidden unless `mobileRole` set). |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `#body` | `{ data: T, field: string, index: number }` | Custom cell rendering. |
| `#editor` | `{ data: T, field: string, index: number, editorCallback: Function }` | Custom inline editor. |
| `#header` | `{ column: VcColumnProps }` | Custom header cell content. |
| `#filter` | `{ field, value, updateValue, applyFilter, clearFilter, startDate, endDate, ... }` | Custom filter UI. |

---

## VcDataTable Props Reference

### Data

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | Array of data items to display. |
| `dataKey` | `string` | `"id"` | Field name used as unique row identifier. |
| `loading` | `boolean` | `false` | Show loading overlay. |
| `skeletonRows` | `number` | -- | Number of skeleton rows during initial loading. |

### Selection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selection` | `T \| T[]` | -- | Selected item(s). Use with `v-model:selection`. |
| `selectionMode` | `"single" \| "multiple"` | -- | Row selection mode. |
| `isRowSelectable` | `(data: T) => boolean` | -- | Per-row function to disable selection. |
| `compareSelectionBy` | `"equals" \| "field"` | -- | Compare items by deep equality or by `dataKey` field. |
| `selectAll` | `boolean` | `false` | Enable "select all" header checkbox. |
| `selectAllActive` | `boolean` | `false` | Whether "select all" (including non-visible items) is active. Use with `v-model:selectAllActive`. |
| `activeItemId` | `string` | -- | ID of the highlighted row. Use with `v-model:activeItemId`. |

### Sorting

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortField` | `string` | -- | Currently sorted field. Use with `v-model:sortField`. |
| `sortOrder` | `1 \| -1 \| 0` | `0` | Sort direction. Use with `v-model:sortOrder`. |
| `sortMode` | `"single" \| "multiple"` | `"single"` | Single or multi-column sort. |
| `multiSortMeta` | `SortMeta[]` | `[]` | Multi-sort metadata. Use with `v-model:multiSortMeta`. |
| `removableSort` | `boolean` | `false` | Allow 3-state sort cycle (asc -> desc -> none). |

### Editing

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `editMode` | `"cell" \| "row" \| "inline"` | -- | Inline editing mode. |
| `editingRows` | `T[]` | -- | Currently editing rows. Use with `v-model:editingRows`. |
| `addRow` | `AddRowConfig` | -- | Add-row button configuration for inline edit mode. |
| `validationRules` | `Record<string, (value, row) => string \| true>` | -- | Field-level validators for inline editing. |

### Visual

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `striped` | `boolean` | `false` | Alternate row backgrounds. |
| `bordered` | `boolean` | `false` | Border around the table. |
| `showGridlines` | `boolean` | `false` | Grid lines between cells. |
| `rowHover` | `boolean` | `true` | Highlight rows on hover. |
| `size` | `"small" \| "normal" \| "large"` | `"normal"` | Row density. |
| `variant` | `"default" \| "striped" \| "bordered"` | `"default"` | Visual variant. |
| `rowClass` | `(data: T) => string \| object` | -- | Per-row CSS class function. |
| `rowStyle` | `(data: T) => object` | -- | Per-row inline style function. |

### Column Management

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resizableColumns` | `boolean` | `true` | Allow column resize by dragging header borders. |
| `reorderableColumns` | `boolean` | `true` | Allow column reorder by dragging headers. |
| `showAllColumns` | `boolean` | `true` | When `false`, only `alwaysVisible` columns are shown. |
| `columnSwitcher` | `boolean \| "auto" \| "defined"` | `true` | Column visibility toggle panel. |

### Scrolling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollable` | `boolean` | `false` | Enable scroll within the table container. |
| `scrollHeight` | `string` | -- | Fixed height for the scroll container (e.g. `"400px"`). |
| `infiniteScroll` | `boolean` | `false` | Enable infinite scroll. |
| `infiniteScrollDistance` | `number` | `100` | Distance in px from bottom to trigger `@load-more`. |

### Row Actions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowActions` | `(item: T) => TableAction[]` | -- | Per-row action items. |
| `rowActionsMode` | `"inline" \| "dropdown"` | `"inline"` | Action display mode. |
| `rowActionsPosition` | `"overlay" \| "column"` | `"overlay"` | Float over row or fixed column. |
| `maxQuickActions` | `number` | `4` | Max quick actions before overflow dropdown. |

### Expandable Rows

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `expandedRows` | `T[]` | `[]` | Expanded rows. Use with `v-model:expandedRows`. |
| `expandedRowIcon` | `string` | `"lucide-chevron-down"` | Icon for expanded state. |
| `collapsedRowIcon` | `string` | `"lucide-chevron-right"` | Icon for collapsed state. |
| `isRowExpandable` | `(data: T) => boolean` | -- | Per-row predicate to hide the expand toggle. |

### Row Grouping

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groupRowsBy` | `string \| string[]` | -- | Field(s) to group rows by. |
| `rowGroupMode` | `"subheader" \| "rowspan"` | `"subheader"` | Group display mode. |
| `expandableRowGroups` | `boolean` | `false` | Allow collapsing/expanding groups. |
| `expandedRowGroups` | `string[]` | -- | Expanded group keys. Use with `v-model:expandedRowGroups`. |

### Pagination

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pagination` | `DataTablePagination` | -- | `{ currentPage, pages, pageSize?, variant? }`. Omit to hide. |
| `totalCount` | `number` | -- | Total item count (for "Showing X of Y" and select-all). |
| `totalLabel` | `string` | -- | Label for the total counter. |

### Search

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `boolean` | `false` | Show search bar. |
| `searchValue` | `string` | -- | Search input value. Use with `v-model:searchValue`. |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder text. |
| `searchDebounce` | `number` | `300` | Debounce delay in ms. |

### Filters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `globalFilters` | `GlobalFilterConfig[]` | -- | Global filter panel configuration. |

### State Persistence

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stateKey` | `string` | -- | Key for persisting state. Omit to disable persistence. |
| `stateStorage` | `"local" \| "session"` | `"local"` | Storage backend. |

### Empty States

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `emptyState` | `TableStateConfig` | -- | `{ icon?, title?, description?, actionLabel?, actionHandler? }` |
| `notFoundState` | `TableStateConfig` | -- | Same shape, shown when search/filters are active. |

### Mobile

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pullToRefresh` | `boolean` | `false` | Enable pull-to-refresh on mobile. |
| `pullToRefreshText` | `PullToRefreshTextConfig` | -- | Custom text for pull/release/refreshing states. |
| `reorderableRows` | `boolean` | `false` | Enable row drag-and-drop. |

---

## VcDataTable Events Reference

### Selection Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:selection` | `T \| T[]` | v-model update for selection. |
| `update:selectAll` | `boolean` | v-model update for select-all checkbox. |
| `update:selectAllActive` | `boolean` | v-model update for "select all" active state. |
| `row-select` | `{ data: T, originalEvent: Event }` | Row selected. |
| `row-unselect` | `{ data: T, originalEvent: Event }` | Row deselected. |
| `row-select-all` | `{ data: T[], originalEvent: Event }` | All visible rows selected. |
| `row-unselect-all` | `{ data: T[], originalEvent: Event }` | All visible rows deselected. |
| `select-all` | `{ selected: boolean }` | "Select all" banner toggle (includes non-visible). |

### Editing Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:editingRows` | `T[]` | v-model update for currently editing rows. |
| `cell-edit-init` | `{ data: T, field: string, index: number }` | Cell entered edit mode. |
| `cell-edit-complete` | `{ data: T, field: string, newValue: unknown, index: number }` | Cell edit committed. |
| `cell-edit-cancel` | `{ data: T, field: string, index: number }` | Cell edit cancelled. |
| `row-edit-init` | `{ data: T, index: number }` | Row entered edit mode. |
| `row-edit-save` | `{ data: T, newData: T, index: number }` | Row edits saved. |
| `row-edit-cancel` | `{ data: T, index: number }` | Row edits cancelled. |
| `edit-save` | `{ changes: EditChange<T>[] }` | Bulk inline edits saved. |
| `edit-cancel` | -- | Bulk inline editing cancelled. |
| `row-add` | `{ defaults: Record<string, unknown>, cancel: () => void }` | New row being added. |
| `row-remove` | `{ data: T, index: number, cancel: () => void }` | Row being removed. |

### Sorting Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:sortField` | `string` | v-model update for sorted field. |
| `update:sortOrder` | `number` | v-model update for sort direction. |
| `update:multiSortMeta` | `SortMeta[]` | v-model update for multi-sort. |
| `sort` | `{ sortField?, sortOrder?, multiSortMeta? }` | Sort changed -- use for server-side sorting. |

### Filtering Events

| Event | Payload | Description |
|-------|---------|-------------|
| `filter` | `{ filters: Record<string, unknown>, filteredValue: T[] }` | Any filter value changed. |

### Row Interaction Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-click` | `{ data: T, index: number, originalEvent: Event }` | Row clicked. |
| `row-action` | `{ action: TableAction, item: T, index: number }` | Row action triggered. |

### Reorder Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-reorder` | `{ dragIndex, dropIndex, value: T[] }` | Row drag-and-drop completed. |
| `column-resize-end` | `{ columns: { id, width }[] }` | Column resize completed. |
| `column-reorder` | `{ columns: { id, ... }[] }` | Column reorder completed. |

### Expansion Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:expandedRows` | `T[]` | v-model update for expanded rows. |
| `row-expand` | `{ data: T, originalEvent: Event }` | Row expanded. |
| `row-collapse` | `{ data: T, originalEvent: Event }` | Row collapsed. |
| `update:expandedRowGroups` | `string[]` | v-model update for expanded groups. |
| `rowgroup-expand` | `{ data: string, originalEvent: Event }` | Row group expanded. |
| `rowgroup-collapse` | `{ data: string, originalEvent: Event }` | Row group collapsed. |

### Other Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pagination-click` | `number` | Page button clicked. |
| `update:searchValue` | `string` | v-model update for search input. |
| `search` | `string` | Debounced search value. |
| `load-more` | -- | Infinite scroll threshold reached. |
| `pull-refresh` | -- | Mobile pull-to-refresh triggered. |
| `state-save` | `DataTablePersistedState` | State saved to storage. |
| `state-restore` | `DataTablePersistedState` | State restored from storage. |
| `update:activeItemId` | `string \| undefined` | v-model update for active row. |

---

## VcDataTable Slots Reference

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | VcColumn declarations (required). |
| `header` | -- | Custom header content above the table. |
| `footer` | -- | Custom footer content below the table body. |
| `search-header-actions` | -- | Extra buttons in the search toolbar (beside filter icon). |
| `selection-banner` | `{ count, totalCount, isSelectAll, selectAll, clearSelection }` | Custom selection banner. |
| `expansion` | `{ data: T, index: number }` | Content rendered below an expanded row. |
| `empty` | -- | Custom empty state (no items, no search). |
| `not-found` | -- | Custom not-found state (no items + active search/filters). |
| `loading` | -- | Custom loading state. |
| `groupheader` | `{ data: T, index: number }` | Custom row group header. |
| `groupfooter` | `{ data: T, index: number }` | Custom row group footer. |
| `pagination` | `{ pages, currentPage, onPageClick }` | Custom pagination replacing built-in VcPagination. |

---

## Recipes

### Recipe 1: Products List Blade

A typical list blade with search, pagination, row actions, and empty states -- modeled after real vendor-portal usage.

```vue
<template>
  <VcBlade
    :title="$t('PRODUCTS.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :toolbar-items="toolbar"
    @close="$emit('close:blade')"
  >
    <VcDataTable
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      v-model:search-value="searchValue"
      v-model:active-item-id="selectedItemId"
      v-model:selection="selectedProducts"
      :loading="loading"
      class="tw-grow tw-basis-0"
      selection-mode="multiple"
      :items="products"
      :row-actions="getActions"
      :pagination="{ currentPage: page, pages: totalPages }"
      :searchable="true"
      :search-placeholder="$t('PRODUCTS.LIST.SEARCH_PLACEHOLDER')"
      :total-count="totalCount"
      state-key="products_list"
      :pull-to-refresh="true"
      :empty-state="{
        icon: 'lucide-package-open',
        title: $t('PRODUCTS.LIST.EMPTY'),
        actionLabel: $t('PRODUCTS.LIST.ADD'),
        actionHandler: addProduct,
      }"
      :not-found-state="{
        icon: 'lucide-search-x',
        title: $t('PRODUCTS.LIST.NOT_FOUND'),
        actionLabel: $t('PRODUCTS.LIST.CLEAR_SEARCH'),
        actionHandler: () => { searchValue = ''; },
      }"
      @search="onSearch"
      @row-click="onRowClick"
      @pagination-click="onPageChange"
      @pull-refresh="reload"
    >
      <VcColumn
        id="imgSrc"
        :title="$t('PRODUCTS.LIST.IMAGE')"
        width="60px"
        :always-visible="true"
        type="image"
        mobile-role="image"
      />
      <VcColumn
        id="name"
        field="name"
        :title="$t('PRODUCTS.LIST.NAME')"
        :sortable="true"
        :always-visible="true"
        mobile-role="title"
      />
      <VcColumn
        id="createdDate"
        field="createdDate"
        :title="$t('PRODUCTS.LIST.CREATED')"
        type="date-ago"
        :sortable="true"
        mobile-role="field"
      />
      <VcColumn
        id="price"
        field="price"
        :title="$t('PRODUCTS.LIST.PRICE')"
        type="money"
        align="end"
        :sortable="true"
        mobile-role="field"
      />
      <VcColumn
        id="stock"
        field="stock"
        :title="$t('PRODUCTS.LIST.STOCK')"
        type="number"
        mobile-role="field"
      />
      <VcColumn
        id="status"
        field="status"
        :title="$t('PRODUCTS.LIST.STATUS')"
        mobile-role="status"
      />
    </VcDataTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade, VcDataTable, VcColumn } from "@vc-shell/framework";

const sortField = ref("name");
const sortOrder = ref<1 | -1 | 0>(1);
const searchValue = ref("");
const selectedItemId = ref<string>();
const selectedProducts = ref<Product[]>([]);
const page = ref(1);

function onSearch(keyword: string) {
  page.value = 1;
  fetchProducts({ keyword, sort: `${sortField.value}:${sortOrder.value === 1 ? "ASC" : "DESC"}` });
}

function onPageChange(newPage: number) {
  page.value = newPage;
  fetchProducts({ page: newPage });
}

function onRowClick(event: { data: Product }) {
  openProductBlade(event.data.id);
}
</script>
```

### Recipe 2: Server-Side Sorting and Pagination

Handle sorting and paging entirely on the backend:

```vue
<template>
  <VcDataTable
    :items="orders"
    :loading="loading"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    :pagination="{ currentPage: page, pages: totalPages }"
    :total-count="totalCount"
    @sort="onSort"
    @pagination-click="onPage"
  >
    <VcColumn id="number" field="number" title="Order #" sortable />
    <VcColumn id="customer" field="customerName" title="Customer" sortable sort-field="customer.name" />
    <VcColumn id="total" field="total" title="Total" type="money" sortable align="end" />
    <VcColumn id="date" field="createdDate" title="Date" type="datetime" sortable />
  </VcDataTable>
</template>

<script setup lang="ts">
const sortField = ref("createdDate");
const sortOrder = ref<1 | -1 | 0>(-1);
const page = ref(1);

async function fetchOrders() {
  loading.value = true;
  const { items, totalCount: total, pages } = await api.searchOrders({
    sort: sortOrder.value !== 0 ? `${sortField.value}:${sortOrder.value === 1 ? "ASC" : "DESC"}` : undefined,
    skip: (page.value - 1) * 20,
    take: 20,
  });
  orders.value = items;
  totalCount.value = total;
  totalPages.value = pages;
  loading.value = false;
}

function onSort() { page.value = 1; fetchOrders(); }
function onPage(p: number) { page.value = p; fetchOrders(); }
</script>
```

### Recipe 3: Editable Price List with Validation

```vue
<template>
  <VcDataTable
    :items="priceList"
    edit-mode="inline"
    :add-row="{ enabled: true, position: 'header', label: 'Add Price' }"
    :validation-rules="rules"
    @edit-save="onSave"
    @row-add="onRowAdd"
    @row-remove="onRowRemove"
  >
    <VcColumn id="sku" field="sku" title="SKU" editable />
    <VcColumn id="name" field="name" title="Product Name" editable />
    <VcColumn id="listPrice" field="listPrice" title="List Price" type="money" editable align="end" />
    <VcColumn id="salePrice" field="salePrice" title="Sale Price" type="money" editable align="end" />
    <VcColumn id="minQuantity" field="minQuantity" title="Min Qty" type="number" editable align="end" />
  </VcDataTable>
</template>

<script setup lang="ts">
const rules = {
  sku: (v: unknown) => (v ? true : "SKU is required"),
  name: (v: unknown) => (v ? true : "Name is required"),
  listPrice: (v: unknown) => (Number(v) > 0 ? true : "Must be greater than 0"),
  salePrice: (v: unknown, row: any) =>
    Number(v) <= Number(row.listPrice) ? true : "Sale price cannot exceed list price",
};

function onSave(event: { changes: EditChange[] }) {
  event.changes.forEach(({ newData }) => {
    api.updatePrice(newData);
  });
}

function onRowAdd(event: { defaults: Record<string, unknown> }) {
  event.defaults.listPrice = 0;
  event.defaults.salePrice = 0;
  event.defaults.minQuantity = 1;
}

function onRowRemove(event: { data: PriceEntry; cancel: () => void }) {
  if (!confirm(`Delete ${event.data.sku}?`)) {
    event.cancel();
  }
}
</script>
```

---

## Common Mistakes

### 1. Missing `dataKey` with non-`id` identifiers

```vue
<!-- WRONG: items have `sku` as primary key, but dataKey defaults to "id" -->
<VcDataTable :items="products">
  <VcColumn id="sku" field="sku" title="SKU" />
</VcDataTable>

<!-- CORRECT: tell the table which field is the unique key -->
<VcDataTable :items="products" data-key="sku">
  <VcColumn id="sku" field="sku" title="SKU" />
</VcDataTable>
```

### 2. Forgetting `editable` on VcColumn

```vue
<!-- WRONG: edit-mode is set, but no columns are marked editable -->
<VcDataTable :items="products" edit-mode="cell">
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>

<!-- CORRECT: add `editable` to columns that should be editable -->
<VcDataTable :items="products" edit-mode="cell">
  <VcColumn id="name" field="name" title="Name" editable />
</VcDataTable>
```

### 3. Infinite scroll without `scroll-height`

```vue
<!-- WRONG: table grows to fit all items, scroll event never fires -->
<VcDataTable :items="products" :infinite-scroll="true" @load-more="load">
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>

<!-- CORRECT: constrain the height so internal scrolling activates -->
<VcDataTable :items="products" :infinite-scroll="true" scroll-height="500px" @load-more="load">
  <VcColumn id="name" field="name" title="Name" />
</VcDataTable>
```

### 4. Mutating items array instead of replacing it

```vue
<!-- WRONG: Vue cannot detect in-place splice for reactivity -->
<script setup>
function onReorder(event) {
  products.value.splice(event.dragIndex, 1);
  // ...
}
</script>

<!-- CORRECT: replace the whole array -->
<script setup>
function onReorder(event) {
  products.value = event.value; // event.value is the new array
}
</script>
```

### 5. Using `type="date-time"` instead of `type="datetime"`

```vue
<!-- WRONG: VcColumn uses "datetime" (no hyphen) -->
<VcColumn id="date" field="createdDate" type="date-time" />

<!-- CORRECT -->
<VcColumn id="date" field="createdDate" type="datetime" />
```

> **Note:** The legacy `ITableColumns` interface uses `"date-time"` with a hyphen. VcColumn and VcDataTable use `"datetime"` without one. VcTableAdapter handles the mapping automatically.

### 6. Duplicate column IDs

```vue
<!-- WRONG: two columns with the same id causes unpredictable behavior -->
<VcColumn id="name" field="firstName" title="First Name" />
<VcColumn id="name" field="lastName" title="Last Name" />

<!-- CORRECT: each id must be unique -->
<VcColumn id="firstName" field="firstName" title="First Name" />
<VcColumn id="lastName" field="lastName" title="Last Name" />
```

### 7. Passing `isRowSelectable` as a static value

```vue
<!-- WRONG: captured once at setup, never updates -->
<script setup>
const isSelectable = (item) => item.stock > 0;
</script>

<!-- CORRECT: this works fine because the function reference is stable.
     The mistake is passing it to a composable that captures it statically.
     If you use VcDataTable's prop directly, it always re-evaluates. -->
<VcDataTable :is-row-selectable="(item) => item.stock > 0">
  ...
</VcDataTable>
```

### 8. Shared `stateKey` between tables

```vue
<!-- WRONG: both tables write to the same storage key -->
<VcDataTable :items="products" state-key="list">...</VcDataTable>
<VcDataTable :items="orders" state-key="list">...</VcDataTable>

<!-- CORRECT: unique keys -->
<VcDataTable :items="products" state-key="products-list">...</VcDataTable>
<VcDataTable :items="orders" state-key="orders-list">...</VcDataTable>
```

---

## Related Components

| Component | Description |
|-----------|-------------|
| **VcTableAdapter** (`VcTable`) | Legacy API wrapper around VcDataTable. Exported as `VcTable` for backward compatibility. Use VcDataTable directly for new code. |
| **VcColumn** | Renderless column definition component. Must be a direct child of VcDataTable. |
| **TableColumnSwitcher** | Column visibility panel -- built into VcDataTable, no separate usage needed. |
| **VcPagination** | Pagination molecule -- used internally when the `pagination` prop is set. Can be used standalone. |
| **TableSearchHeader** | Search bar + toolbar -- built into VcDataTable when `searchable` is `true`. |

---

## Accessibility

- Table root has `aria-busy` when loading.
- Selection checkboxes use native `<input type="checkbox">` with labels.
- Sort indicators are announced via `aria-sort` on column headers.
- Keyboard: Tab through interactive cells; Enter/Escape to commit/cancel edits.
- Empty state provides a descriptive message for screen readers.
