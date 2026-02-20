import type { Meta, StoryFn } from "@storybook/vue3";
import { ref, h, onMounted, onUnmounted } from "vue";
import { VcDataTable, VcColumn, TableColumnSwitcher } from "@ui/components/organisms/vc-table";
import { VcInput, VcSelect } from "@ui/components/molecules";
import { VcButton } from "@ui/components/atoms";
import { withMobileView } from "../../../../../.storybook/decorators";

export default {
  title: "organisms/VcTable/Declarative API (VcDataTable)",
  component: VcDataTable,
} as Meta;

interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  stock: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 1299.99,
    currency: "USD",
    stock: 45,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 49.99,
    currency: "USD",
    stock: 120,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 89.99,
    currency: "EUR",
    stock: 0,
    status: "Out of Stock",
    isActive: false,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 4,
    name: 'Monitor 27"',
    price: 399.99,
    currency: "USD",
    stock: 15,
    status: "Low Stock",
    isActive: true,
    createdAt: new Date("2024-03-05"),
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    price: 149.99,
    currency: "EUR",
    stock: 75,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-28"),
  },
];

/**
 * Basic usage of VcDataTable with VcColumn
 *
 */
export const Basic: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with sorting
 */
export const WithSorting: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const sortField = ref("name");
    const sortOrder = ref<1 | -1 | 0>(1);

    const sortedProducts = ref(
      [...mockProducts].sort((a, b) => {
        const field = sortField.value as keyof Product;
        if (sortOrder.value === 0) return 0;
        const aVal = a[field];
        const bVal = b[field];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder.value * aVal.localeCompare(bVal);
        }
        return sortOrder.value * (Number(aVal) - Number(bVal));
      }),
    );

    const handleSort = (e: { sortField: string; sortOrder: number }) => {
      sortField.value = e.sortField;
      sortOrder.value = e.sortOrder as 1 | -1 | 0;
      const field = e.sortField as keyof Product;
      sortedProducts.value = [...mockProducts].sort((a, b) => {
        if (e.sortOrder === 0) return 0;
        const aVal = a[field];
        const bVal = b[field];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return e.sortOrder * aVal.localeCompare(bVal);
        }
        return e.sortOrder * (Number(aVal) - Number(bVal));
      });
    };

    return { products: sortedProducts, sortField, sortOrder, handleSort };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Sort: {{ sortField }} ({{ sortOrder === 1 ? 'ASC' : sortOrder === -1 ? 'DESC' : 'NONE' }})</p>
      <VcDataTable
        :items="products"
        :sort-field="sortField"
        :sort-order="sortOrder"
        :removable-sort="true"
        @sort="handleSort"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with selection
 */
export const WithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);

    return { products: mockProducts, selection };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Selected: {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        selection-mode="multiple"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with selection and disabled rows
 */
export const WithSelectableRows: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);

    // Only allow selection of in-stock items
    const isRowSelectable = (product: Product) => product.stock > 0;

    return { products: mockProducts, selection, isRowSelectable };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">Only items with stock > 0 can be selected</p>
      <p class="tw-mb-2">Selected: {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        selection-mode="multiple"
        :is-row-selectable="isRowSelectable"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with all cell types
 */
export const WithCellTypes: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name (text)" width="180px" />
        <VcColumn id="price" field="price" title="Price (money)" type="money" currency-field="currency" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock (number)" type="number" width="100px" />
        <VcColumn id="createdAt" field="createdAt" title="Created (date)" type="date" width="140px" />
        <VcColumn id="isActive" field="isActive" title="Active (status-icon)" type="status-icon" width="100px" align="center" />
        <VcColumn id="status" field="status" title="Status (status)" type="status" width="120px" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with custom cell content via slots
 */
export const WithCustomCells: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name">
          <template #body="{ data }">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-font-semibold">{{ data.name }}</span>
              <span v-if="!data.isActive" class="tw-text-xs tw-text-danger-500">(inactive)</span>
            </div>
          </template>
        </VcColumn>
        <VcColumn id="price" field="price" title="Price">
          <template #body="{ data }">
            <span :class="{ 'tw-text-success-600': data.price < 100, 'tw-text-danger-600': data.price >= 100 }">
              {{ data.price.toFixed(2) }}
            </span>
          </template>
        </VcColumn>
        <VcColumn id="stock" field="stock" title="Stock">
          <template #body="{ data }">
            <div class="tw-flex tw-items-center tw-gap-1">
              <span>{{ data.stock }}</span>
              <span v-if="data.stock === 0" class="tw-px-1 tw-text-xs tw-bg-danger-100 tw-text-danger-700 tw-rounded">OUT</span>
              <span v-else-if="data.stock < 20" class="tw-px-1 tw-text-xs tw-bg-warning-100 tw-text-warning-700 tw-rounded">LOW</span>
            </div>
          </template>
        </VcColumn>
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with built-in pagination via `pagination` prop
 */
export const WithPagination: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const currentPage = ref(1);
    const pageSize = 3;
    const totalPages = Math.ceil(mockProducts.length / pageSize);

    const paginatedProducts = ref(mockProducts.slice(0, pageSize));

    const handlePagination = (page: number) => {
      currentPage.value = page;
      const start = (page - 1) * pageSize;
      paginatedProducts.value = mockProducts.slice(start, start + pageSize);
    };

    return { products: paginatedProducts, currentPage, totalPages, handlePagination };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable
        :items="products"
        :pagination="{ currentPage, pages: totalPages }"
        @pagination-click="handlePagination"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with striped variant
 */
export const Striped: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products" striped>
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with bordered variant
 */
export const Bordered: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products" bordered>
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with loading state
 */
export const Loading: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products" :loading="true">
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with empty state
 */
export const Empty: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: [] };
  },
  template: `
    <div style="height: 400px">
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />

        <template #empty>
          <div class="tw-text-center tw-p-8 tw-text-neutrals-500">
            <p class="tw-text-lg tw-font-semibold">No products found</p>
            <p class="tw-text-sm">Try adding some products to see them here.</p>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with header slot
 */
export const WithHeader: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcInput },
  setup() {
    const searchQuery = ref("");
    const filteredProducts = ref(mockProducts);

    const handleSearch = () => {
      const query = searchQuery.value.toLowerCase();
      filteredProducts.value = mockProducts.filter(
        (p) => p.name.toLowerCase().includes(query) || p.status.toLowerCase().includes(query),
      );
    };

    return { products: filteredProducts, searchQuery, handleSearch };
  },
  template: `
    <div style="height: 450px">
      <VcDataTable :items="products">
        <template #header>
          <div class="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b">
            <h3 class="tw-text-lg tw-font-semibold">Products</h3>
            <VcInput
              v-model="searchQuery"
              placeholder="Search products..."
              @input="handleSearch"
              style="width: 200px"
            />
          </div>
        </template>

        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with selection column via VcColumn
 *
 * This demonstrates defining a selection column via VcColumn with selectionMode prop.
 */
export const SelectionViaVcColumn: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);

    return { products: mockProducts, selection };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Selected: {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with single selection (click row to select)
 *
 * In single selection mode, clicking a row selects it. No checkbox column is shown.
 */
export const SingleSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product | undefined>(undefined);

    return { products: mockProducts, selection };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Selected: {{ selection?.name || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        selection-mode="single"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with single selection via VcColumn (radio button style)
 */
export const SingleSelectionViaVcColumn: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product | undefined>(undefined);

    return { products: mockProducts, selection };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Selected: {{ selection?.name || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
      >
        <VcColumn id="selection" selection-mode="single" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with selection and isRowSelectable via VcColumn
 *
 * Demonstrates disabled checkboxes for rows that don't meet the criteria.
 */
export const SelectionWithDisabledRowsViaVcColumn: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);

    // Only allow selection of items that are active and in stock
    const isRowSelectable = (product: Product) => product.isActive && product.stock > 0;

    return { products: mockProducts, selection, isRowSelectable };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">Only active items with stock > 0 can be selected (USB-C Hub is disabled)</p>
      <p class="tw-mb-2">Selected: {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        :is-row-selectable="isRowSelectable"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="isActive" field="isActive" title="Active" type="status-icon" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with selection events
 *
 * Demonstrates row-select and row-unselect events.
 */
export const SelectionWithEvents: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);
    const eventLog = ref<string[]>([]);

    const handleRowSelect = (e: { data: Product }) => {
      eventLog.value.unshift(`Selected: ${e.data.name}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    const handleRowUnselect = (e: { data: Product }) => {
      eventLog.value.unshift(`Unselected: ${e.data.name}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    const handleSelectAll = (e: { data: Product[] }) => {
      eventLog.value.unshift(`Select All: ${e.data.length} items`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    const handleUnselectAll = () => {
      eventLog.value.unshift("Unselect All");
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    return {
      products: mockProducts,
      selection,
      eventLog,
      handleRowSelect,
      handleRowUnselect,
      handleSelectAll,
      handleUnselectAll,
    };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Event Log:</p>
        <ul class="tw-list-disc tw-list-inside">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No events yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        selection-mode="multiple"
        @row-select="handleRowSelect"
        @row-unselect="handleRowUnselect"
        @row-select-all="handleSelectAll"
        @row-unselect-all="handleUnselectAll"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Editing Stories
// ============================================================================

/**
 * VcDataTable with cell editing
 *
 * Click on a cell to edit it. Press Enter or click outside to save.
 */
export const CellEditing: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcInput },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);

    const handleCellEditComplete = (e: { data: any; field: string; newValue: unknown; index: number }) => {
      eventLog.value.unshift(`Cell edited: ${e.field} = ${e.newValue}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
      // Update the value
      e.data[e.field] = e.newValue;
    };

    return { products, eventLog, handleCellEditComplete };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Click on Name or Stock cell to edit:</p>
        <ul class="tw-list-disc tw-list-inside">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No edits yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        edit-mode="cell"
        @cell-edit-complete="handleCellEditComplete"
      >
        <VcColumn id="name" field="name" title="Name" :editable="true">
          <template #editor="{ data, field, editorCallback }">
            <VcInput
              :model-value="data[field]"
              @update:model-value="editorCallback"
              autofocus
              style="width: 100%"
            />
          </template>
        </VcColumn>
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :editable="true">
          <template #editor="{ data, field, editorCallback }">
            <VcInput
              :model-value="data[field]"
              @update:model-value="(v) => editorCallback(Number(v))"
              type="number"
              autofocus
              style="width: 80px"
            />
          </template>
        </VcColumn>
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with row editing
 *
 * Click the edit button to enable row editing. Click save/cancel to commit/revert.
 */
export const RowEditing: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcInput },
  setup() {
    const products = ref([...mockProducts]);
    const editingRows = ref<any[]>([]);
    const eventLog = ref<string[]>([]);

    const handleRowEditSave = (e: { data: any; newData: any; index: number }) => {
      eventLog.value.unshift(`Row saved: ${e.newData.name} (price: ${e.newData.price})`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    const handleRowEditCancel = (e: { data: any; index: number }) => {
      eventLog.value.unshift(`Row edit cancelled: ${e.data.name}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    return { products, editingRows, eventLog, handleRowEditSave, handleRowEditCancel };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Click edit button (✎) to edit a row:</p>
        <ul class="tw-list-disc tw-list-inside">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No edits yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        v-model:editing-rows="editingRows"
        edit-mode="row"
        @row-edit-save="handleRowEditSave"
        @row-edit-cancel="handleRowEditCancel"
      >
        <VcColumn id="name" field="name" title="Name" :editable="true">
          <template #editor="{ data, field }">
            <VcInput v-model="data[field]" style="width: 100%" />
          </template>
        </VcColumn>
        <VcColumn id="price" field="price" title="Price" :editable="true">
          <template #body="{ data }">
            \${{ data.price.toFixed(2) }}
          </template>
          <template #editor="{ data, field }">
            <VcInput v-model.number="data[field]" type="number" style="width: 100px" />
          </template>
        </VcColumn>
        <VcColumn id="stock" field="stock" title="Stock" type="number" :editable="true">
          <template #editor="{ data, field }">
            <VcInput v-model.number="data[field]" type="number" style="width: 80px" />
          </template>
        </VcColumn>
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="editor" :row-editor="true" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with row editing and custom editor buttons
 *
 * Shows how to combine row editing with selection.
 */
export const RowEditingWithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcInput },
  setup() {
    const products = ref([...mockProducts]);
    const editingRows = ref<any[]>([]);
    const selection = ref<any[]>([]);

    return { products, editingRows, selection };
  },
  template: `
    <div style="height: 450px">
      <p class="tw-mb-2">Selected: {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      <p class="tw-mb-2 tw-text-sm tw-text-neutrals-600">Editing: {{ editingRows.map(p => p.name).join(', ') || 'None' }}</p>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        v-model:editing-rows="editingRows"
        edit-mode="row"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" :editable="true">
          <template #editor="{ data, field }">
            <VcInput v-model="data[field]" style="width: 100%" />
          </template>
        </VcColumn>
        <VcColumn id="price" field="price" title="Price" type="money" :editable="true">
          <template #editor="{ data, field }">
            <VcInput v-model.number="data[field]" type="number" style="width: 100px" />
          </template>
        </VcColumn>
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="editor" :row-editor="true" />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Multi-Sort Stories
// ============================================================================

/**
 * VcDataTable with multi-sort support
 *
 * Hold Ctrl (or Cmd on Mac) and click on column headers to add multiple sort columns.
 * The sort order badge (1, 2, 3...) shows the priority of each sorted column.
 * Regular click replaces all sorts with the clicked column.
 */
export const MultiSort: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const multiSortMeta = ref<{ field: string; order: 1 | -1 | 0 }[]>([]);

    const sortedProducts = ref([...mockProducts]);

    const handleSort = (e: { multiSortMeta: { field: string; order: 1 | -1 | 0 }[] }) => {
      multiSortMeta.value = e.multiSortMeta;

      // Apply multi-sort to products
      sortedProducts.value = [...mockProducts].sort((a, b) => {
        for (const meta of e.multiSortMeta) {
          const field = meta.field as keyof Product;
          const aVal = a[field];
          const bVal = b[field];
          let comparison = 0;

          if (typeof aVal === "string" && typeof bVal === "string") {
            comparison = aVal.localeCompare(bVal);
          } else {
            comparison = Number(aVal) - Number(bVal);
          }

          if (comparison !== 0) {
            return meta.order * comparison;
          }
        }
        return 0;
      });
    };

    const formatSortMeta = () => {
      if (multiSortMeta.value.length === 0) return "None";
      return multiSortMeta.value.map((m, i) => `${i + 1}. ${m.field} (${m.order === 1 ? "ASC" : "DESC"})`).join(", ");
    };

    return { products: sortedProducts, multiSortMeta, handleSort, formatSortMeta };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Multi-Sort Mode</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Hold <kbd class="tw-px-1 tw-bg-neutrals-200 tw-rounded">Ctrl</kbd> (or <kbd class="tw-px-1 tw-bg-neutrals-200 tw-rounded">Cmd</kbd> on Mac) and click column headers to add multiple sort columns.</p>
        <p><strong>Current sort:</strong> {{ formatSortMeta() }}</p>
      </div>
      <VcDataTable
        :items="products"
        sort-mode="multiple"
        :multi-sort-meta="multiSortMeta"
        @sort="handleSort"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" sortable />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with removable sort (triple-click cycle)
 *
 * Click a column to cycle through: ascending -> descending -> no sort
 * This allows users to completely remove sorting from a column.
 */
export const RemovableSort: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const sortField = ref("");
    const sortOrder = ref<1 | -1 | 0>(0);

    const sortedProducts = ref([...mockProducts]);

    const handleSort = (e: { sortField: string; sortOrder: number }) => {
      sortField.value = e.sortField;
      sortOrder.value = e.sortOrder as 1 | -1 | 0;

      if (e.sortOrder === 0 || !e.sortField) {
        // No sort - restore original order
        sortedProducts.value = [...mockProducts];
      } else {
        const field = e.sortField as keyof Product;
        sortedProducts.value = [...mockProducts].sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (typeof aVal === "string" && typeof bVal === "string") {
            return e.sortOrder * aVal.localeCompare(bVal);
          }
          return e.sortOrder * (Number(aVal) - Number(bVal));
        });
      }
    };

    const getSortLabel = () => {
      if (!sortField.value || sortOrder.value === 0) return "None";
      return `${sortField.value} (${sortOrder.value === 1 ? "ASC" : "DESC"})`;
    };

    return { products: sortedProducts, sortField, sortOrder, handleSort, getSortLabel };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Removable Sort</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Click a column header to cycle: <strong>ASC</strong> -> <strong>DESC</strong> -> <strong>None</strong></p>
        <p><strong>Current sort:</strong> {{ getSortLabel() }}</p>
      </div>
      <VcDataTable
        :items="products"
        :sort-field="sortField"
        :sort-order="sortOrder"
        :removable-sort="true"
        @sort="handleSort"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" sortable />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with multi-sort and removable sort combined
 *
 * Ctrl+click to add columns to sort, and clicking a sorted column cycles through ASC -> DESC -> removed.
 */
export const MultiSortRemovable: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const multiSortMeta = ref<{ field: string; order: 1 | -1 | 0 }[]>([]);

    const sortedProducts = ref([...mockProducts]);

    const handleSort = (e: { multiSortMeta: { field: string; order: 1 | -1 | 0 }[] }) => {
      multiSortMeta.value = e.multiSortMeta;

      if (e.multiSortMeta.length === 0) {
        sortedProducts.value = [...mockProducts];
        return;
      }

      sortedProducts.value = [...mockProducts].sort((a, b) => {
        for (const meta of e.multiSortMeta) {
          const field = meta.field as keyof Product;
          const aVal = a[field];
          const bVal = b[field];
          let comparison = 0;

          if (typeof aVal === "string" && typeof bVal === "string") {
            comparison = aVal.localeCompare(bVal);
          } else {
            comparison = Number(aVal) - Number(bVal);
          }

          if (comparison !== 0) {
            return meta.order * comparison;
          }
        }
        return 0;
      });
    };

    const formatSortMeta = () => {
      if (multiSortMeta.value.length === 0) return "None";
      return multiSortMeta.value.map((m, i) => `${i + 1}. ${m.field} (${m.order === 1 ? "ASC" : "DESC"})`).join(", ");
    };

    return { products: sortedProducts, multiSortMeta, handleSort, formatSortMeta };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Multi-Sort with Removable Sort</p>
        <p class="tw-text-neutrals-600 tw-mb-2">
          <kbd class="tw-px-1 tw-bg-neutrals-200 tw-rounded">Ctrl</kbd>+click to add sort columns.
          Clicking a sorted column cycles: ASC -> DESC -> removed.
        </p>
        <p><strong>Current sort:</strong> {{ formatSortMeta() }}</p>
      </div>
      <VcDataTable
        :items="products"
        sort-mode="multiple"
        :multi-sort-meta="multiSortMeta"
        :removable-sort="true"
        @sort="handleSort"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" sortable />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Row Reorder Stories
// ============================================================================

/**
 * VcDataTable with row reorder via VcColumn
 *
 * Add a VcColumn with rowReorder prop to enable drag-and-drop row reordering.
 * A drag handle icon appears in the column, allowing users to drag rows to reorder.
 */
export const RowReorder: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);

    const handleRowReorder = (e: { dragIndex: number; dropIndex: number; value: Product[] }) => {
      eventLog.value.unshift(`Moved row from ${e.dragIndex} to ${e.dropIndex}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
      // Update the products array with the new order
      products.value = e.value;
    };

    return { products, eventLog, handleRowReorder };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Row Reorder with Drag Handle</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Drag rows using the handle icon to reorder them.</p>
        <p><strong>Event Log:</strong></p>
        <ul class="tw-list-disc tw-list-inside tw-text-xs">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No reorder events yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        @row-reorder="handleRowReorder"
      >
        <VcColumn id="reorder" :row-reorder="true" title="" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with row reorder via reorderableRows prop
 *
 * Set reorderableRows to true to enable drag-and-drop on the entire row.
 * This approach allows dragging from anywhere on the row (no drag handle column).
 */
export const RowReorderWithoutHandle: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);

    const handleRowReorder = (e: { dragIndex: number; dropIndex: number; value: Product[] }) => {
      eventLog.value.unshift(`Moved row from ${e.dragIndex} to ${e.dropIndex}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
      products.value = e.value;
    };

    return { products, eventLog, handleRowReorder };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Row Reorder (Entire Row Draggable)</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Drag any part of the row to reorder. Uses reorderableRows prop instead of VcColumn.</p>
        <p><strong>Event Log:</strong></p>
        <ul class="tw-list-disc tw-list-inside tw-text-xs">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No reorder events yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        :reorderable-rows="true"
        @row-reorder="handleRowReorder"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with row reorder and selection combined
 *
 * Demonstrates row reorder working alongside selection checkboxes.
 */
export const RowReorderWithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const selection = ref<Product[]>([]);

    const handleRowReorder = (e: { dragIndex: number; dropIndex: number; value: Product[] }) => {
      products.value = e.value;
    };

    return { products, selection, handleRowReorder };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Row Reorder with Selection</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Both row reordering and selection work together.</p>
        <p><strong>Selected:</strong> {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
      </div>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        @row-reorder="handleRowReorder"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="reorder" :row-reorder="true" title="" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Expandable Rows Stories
// ============================================================================

// Extended product interface with order details for expansion demo
interface OrderProduct extends Product {
  orders?: Array<{
    orderId: string;
    date: string;
    quantity: number;
    customer: string;
  }>;
}

const mockProductsWithOrders: OrderProduct[] = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 1299.99,
    currency: "USD",
    stock: 45,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    orders: [
      { orderId: "ORD-001", date: "2024-03-10", quantity: 2, customer: "John Smith" },
      { orderId: "ORD-005", date: "2024-03-12", quantity: 1, customer: "Jane Doe" },
      { orderId: "ORD-008", date: "2024-03-15", quantity: 3, customer: "Bob Wilson" },
    ],
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 49.99,
    currency: "USD",
    stock: 120,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-10"),
    orders: [
      { orderId: "ORD-002", date: "2024-03-11", quantity: 5, customer: "Alice Brown" },
      { orderId: "ORD-006", date: "2024-03-13", quantity: 10, customer: "Charlie Davis" },
    ],
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 89.99,
    currency: "EUR",
    stock: 0,
    status: "Out of Stock",
    isActive: false,
    createdAt: new Date("2024-01-20"),
    orders: [],
  },
  {
    id: 4,
    name: 'Monitor 27"',
    price: 399.99,
    currency: "USD",
    stock: 15,
    status: "Low Stock",
    isActive: true,
    createdAt: new Date("2024-03-05"),
    orders: [{ orderId: "ORD-003", date: "2024-03-09", quantity: 1, customer: "Eve Johnson" }],
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    price: 149.99,
    currency: "EUR",
    stock: 75,
    status: "In Stock",
    isActive: true,
    createdAt: new Date("2024-02-28"),
    orders: [
      { orderId: "ORD-004", date: "2024-03-08", quantity: 2, customer: "Frank Miller" },
      { orderId: "ORD-007", date: "2024-03-14", quantity: 1, customer: "Grace Lee" },
    ],
  },
];

/**
 * VcDataTable with expandable rows
 *
 * Add a VcColumn with expander prop to enable row expansion.
 * Click the expand icon to reveal additional content for each row.
 * Use the #expansion slot to customize the expanded content.
 */
export const ExpandableRows: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const expandedRows = ref<OrderProduct[]>([]);
    const eventLog = ref<string[]>([]);

    const handleRowExpand = (e: { data: OrderProduct }) => {
      eventLog.value.unshift(`Expanded: ${e.data.name}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    const handleRowCollapse = (e: { data: OrderProduct }) => {
      eventLog.value.unshift(`Collapsed: ${e.data.name}`);
      if (eventLog.value.length > 5) eventLog.value.pop();
    };

    return {
      products: mockProductsWithOrders,
      expandedRows,
      eventLog,
      handleRowExpand,
      handleRowCollapse,
    };
  },
  template: `
    <div style="height: 600px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Expandable Rows</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Click the arrow icon to expand rows and see order details.</p>
        <p><strong>Expanded:</strong> {{ expandedRows.map(p => p.name).join(', ') || 'None' }}</p>
        <p class="tw-mt-2"><strong>Events:</strong></p>
        <ul class="tw-list-disc tw-list-inside tw-text-xs">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No expand/collapse events yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        v-model:expanded-rows="expandedRows"
        @row-expand="handleRowExpand"
        @row-collapse="handleRowCollapse"
      >
        <VcColumn id="expander" :expander="true" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />

        <template #expansion="{ data }">
          <div class="tw-p-4">
            <h4 class="tw-font-semibold tw-mb-3 tw-text-neutrals-700">Order History for {{ data.name }}</h4>
            <div v-if="data.orders && data.orders.length > 0">
              <table class="tw-w-full tw-text-sm tw-border tw-border-neutrals-200">
                <thead class="tw-bg-neutrals-100">
                  <tr>
                    <th class="tw-px-3 tw-py-2 tw-text-left tw-font-medium">Order ID</th>
                    <th class="tw-px-3 tw-py-2 tw-text-left tw-font-medium">Date</th>
                    <th class="tw-px-3 tw-py-2 tw-text-left tw-font-medium">Customer</th>
                    <th class="tw-px-3 tw-py-2 tw-text-right tw-font-medium">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in data.orders" :key="order.orderId" class="tw-border-t tw-border-neutrals-200">
                    <td class="tw-px-3 tw-py-2 tw-font-mono tw-text-primary-600">{{ order.orderId }}</td>
                    <td class="tw-px-3 tw-py-2">{{ order.date }}</td>
                    <td class="tw-px-3 tw-py-2">{{ order.customer }}</td>
                    <td class="tw-px-3 tw-py-2 tw-text-right">{{ order.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="tw-text-neutrals-500 tw-italic">No orders for this product.</p>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with expandable rows and selection
 *
 * Demonstrates expandable rows working alongside selection checkboxes.
 */
export const ExpandableRowsWithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const expandedRows = ref<OrderProduct[]>([]);
    const selection = ref<OrderProduct[]>([]);

    return {
      products: mockProductsWithOrders,
      expandedRows,
      selection,
    };
  },
  template: `
    <div style="height: 600px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Expandable Rows with Selection</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Both row expansion and selection work together.</p>
        <p><strong>Selected:</strong> {{ selection.map(p => p.name).join(', ') || 'None' }}</p>
        <p><strong>Expanded:</strong> {{ expandedRows.map(p => p.name).join(', ') || 'None' }}</p>
      </div>
      <VcDataTable
        :items="products"
        v-model:expanded-rows="expandedRows"
        v-model:selection="selection"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="expander" :expander="true" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />

        <template #expansion="{ data }">
          <div class="tw-p-4 tw-bg-neutrals-50">
            <p class="tw-mb-2"><strong>Product Details:</strong></p>
            <ul class="tw-list-disc tw-list-inside tw-text-sm">
              <li>Created: {{ data.createdAt.toLocaleDateString() }}</li>
              <li>Currency: {{ data.currency }}</li>
              <li>Active: {{ data.isActive ? 'Yes' : 'No' }}</li>
              <li>Total Orders: {{ data.orders?.length || 0 }}</li>
            </ul>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
});

/**
 * VcDataTable with custom expansion icons
 *
 * Customize the expand/collapse icons using the expandedRowIcon and collapsedRowIcon props.
 */
export const ExpandableRowsCustomIcons: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const expandedRows = ref<OrderProduct[]>([]);

    return {
      products: mockProductsWithOrders,
      expandedRows,
    };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Custom Expansion Icons</p>
        <p class="tw-text-neutrals-600">Using plus/minus icons instead of chevrons.</p>
      </div>
      <VcDataTable
        :items="products"
        v-model:expanded-rows="expandedRows"
        expanded-row-icon="fas fa-minus"
        collapsed-row-icon="fas fa-plus"
      >
        <VcColumn id="expander" :expander="true" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="status" field="status" title="Status" />

        <template #expansion="{ data, index }">
          <div class="tw-p-4 tw-bg-success-50 tw-border-l-4 tw-border-success-400">
            <p class="tw-font-medium">Row #{{ index + 1 }}: {{ data.name }}</p>
            <p class="tw-text-sm tw-text-neutrals-600 tw-mt-1">
              This product has {{ data.orders?.length || 0 }} orders with a total stock of {{ data.stock }} units.
            </p>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Column Resize Stories
// ============================================================================

/**
 * Column resize with default settings
 *
 * Drag the border between column headers to resize columns.
 * Uses two-column resize mode: dragging one column affects its neighbor.
 */
export const ColumnResize: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const onResizeEnd = (event: { columns: { id: string; width: number }[] }) => {
      console.log("Column resize end:", event.columns);
    };

    return { products: mockProducts, onResizeEnd };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Column Resize</p>
        <p class="tw-text-neutrals-600">
          Drag the border between column headers to resize. The table uses two-column
          resize mode: resizing one column affects its right neighbor.
        </p>
      </div>
      <VcDataTable
        :items="products"
        :resizable-columns="true"
        @column-resize-end="onResizeEnd"
      >
        <VcColumn id="name" field="name" title="Name" :width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" :width="150" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :width="100" />
        <VcColumn id="status" field="status" title="Status" :width="150" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Column resize with minimum width constraints
 *
 * Columns cannot be resized below 60px (default minimum).
 */
export const ColumnResizeWithMinWidth: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Column Resize with Min Width</p>
        <p class="tw-text-neutrals-600">
          Columns have a minimum width of 60px. Try resizing columns - they will stop
          at the minimum width.
        </p>
      </div>
      <VcDataTable
        :items="products"
        :resizable-columns="true"
      >
        <VcColumn id="name" field="name" title="Product Name" :width="250" />
        <VcColumn id="price" field="price" title="Price" type="money" :width="120" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :width="80" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// Column Reorder Stories
// ============================================================================

/**
 * Column reorder via drag and drop
 *
 * Drag column headers to reorder them. Uses 50% threshold for smooth swapping.
 */
export const ColumnReorder: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const onColumnReorder = (event: { columns: { id: string; width: number }[] }) => {
      console.log("Column reorder:", event.columns);
    };

    return { products: mockProducts, onColumnReorder };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Column Reorder</p>
        <p class="tw-text-neutrals-600">
          Drag column headers to reorder them. Columns swap when you cross the 50%
          threshold of the target column.
        </p>
      </div>
      <VcDataTable
        :items="products"
        :reorderable-columns="true"
        @column-reorder="onColumnReorder"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="createdAt" field="createdAt" title="Created" type="date" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Column reorder with selection column
 *
 * Selection column stays fixed - it cannot be reordered.
 */
export const ColumnReorderWithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const selection = ref<Product[]>([]);
    return { products: mockProducts, selection };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Column Reorder with Selection</p>
        <p class="tw-text-neutrals-600">
          The selection (checkbox) column always stays in the first position and
          cannot be reordered.
        </p>
      </div>
      <VcDataTable
        :items="products"
        v-model:selection="selection"
        :reorderable-columns="true"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Both column resize and reorder enabled
 */
export const ColumnResizeAndReorder: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Column Resize + Reorder</p>
        <p class="tw-text-neutrals-600">
          Both resize and reorder are enabled. Drag column headers to reorder, drag
          the border between columns to resize.
        </p>
      </div>
      <VcDataTable
        :items="products"
        :resizable-columns="true"
        :reorderable-columns="true"
      >
        <VcColumn id="name" field="name" title="Name" :width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" :width="150" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :width="100" />
        <VcColumn id="status" field="status" title="Status" :width="150" />
      </VcDataTable>
    </div>
  `,
});

// ============================================================================
// State Persistence Stories
// ============================================================================

/**
 * State persistence with localStorage
 *
 * Column widths and order are saved to localStorage and restored on page reload.
 */
export const StatePersistence: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const stateKey = "demo-products-table";

    const clearState = () => {
      localStorage.removeItem(`VC_DATATABLE_${stateKey.toUpperCase()}`);
      window.location.reload();
    };

    const onStateSave = (state: object) => {
      console.log("State saved:", state);
    };

    const onStateRestore = (state: object) => {
      console.log("State restored:", state);
    };

    return {
      products: mockProducts,
      stateKey,
      clearState,
      onStateSave,
      onStateRestore,
    };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">State Persistence (localStorage)</p>
        <p class="tw-text-neutrals-600 tw-mb-2">
          Resize or reorder columns, then refresh the page. Your changes will be preserved.
          The state is stored in localStorage with key "VC_DATATABLE_DEMO-PRODUCTS-TABLE".
        </p>
        <VcButton size="xs" variant="danger" @click="clearState">
          Clear Saved State
        </VcButton>
      </div>
      <VcDataTable
        :items="products"
        :resizable-columns="true"
        :reorderable-columns="true"
        :state-key="stateKey"
        state-storage="local"
        @state-save="onStateSave"
        @state-restore="onStateRestore"
      >
        <VcColumn id="name" field="name" title="Name" :width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" :width="150" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :width="100" />
        <VcColumn id="status" field="status" title="Status" :width="150" />
      </VcDataTable>
    </div>
  `,
});

/**
 * State persistence with sessionStorage
 *
 * State is saved to sessionStorage (cleared when browser tab is closed).
 */
export const StatePersistenceSession: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const stateKey = "demo-session-table";

    const clearState = () => {
      sessionStorage.removeItem(`VC_DATATABLE_${stateKey.toUpperCase()}`);
      window.location.reload();
    };

    return { products: mockProducts, stateKey, clearState };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-warning-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">State Persistence (sessionStorage)</p>
        <p class="tw-text-neutrals-600 tw-mb-2">
          Similar to localStorage, but state is cleared when you close the browser tab.
          Useful for temporary state that shouldn't persist across sessions.
        </p>
        <VcButton size="xs" variant="warning" @click="clearState">
          Clear Session State
        </VcButton>
      </div>
      <VcDataTable
        :items="products"
        :resizable-columns="true"
        :reorderable-columns="true"
        :state-key="stateKey"
        state-storage="session"
      >
        <VcColumn id="name" field="name" title="Name" :width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" :width="150" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" :width="100" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Full featured example: all features combined
 *
 * Demonstrates resize, reorder, selection, sorting, and state persistence working together.
 */
export const FullFeaturedTable: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const selection = ref<Product[]>([]);
    const sortField = ref("name");
    const sortOrder = ref<1 | -1 | 0>(1);
    const stateKey = "full-featured-table";

    const clearState = () => {
      localStorage.removeItem(`VC_DATATABLE_${stateKey.toUpperCase()}`);
      window.location.reload();
    };

    return {
      products: mockProducts,
      selection,
      sortField,
      sortOrder,
      stateKey,
      clearState,
    };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-gradient-to-r tw-from-primary-50 tw-to-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">🚀 Full Featured VcDataTable</p>
        <p class="tw-text-neutrals-600 tw-mb-2">
          This example combines all features: multi-select, sorting, column resize,
          column reorder, and state persistence.
        </p>
        <div class="tw-flex tw-gap-2">
          <VcButton size="xs" @click="clearState">Clear State</VcButton>
        </div>
      </div>

      <div v-if="selection.length" class="tw-mb-2 tw-p-2 tw-bg-primary-100 tw-rounded tw-text-sm">
        Selected: {{ selection.map(p => p.name).join(', ') }}
      </div>

      <VcDataTable
        :items="products"
        v-model:selection="selection"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        :resizable-columns="true"
        :reorderable-columns="true"
        :state-key="stateKey"
        state-storage="local"
      >
        <VcColumn id="selection" selection-mode="multiple" />
        <VcColumn id="name" field="name" title="Name" sortable :width="200" />
        <VcColumn id="price" field="price" title="Price" type="money" sortable :width="150" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable :width="100" />
        <VcColumn id="status" field="status" title="Status" :width="150" />
        <VcColumn id="createdAt" field="createdAt" title="Created" type="date" sortable />
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// ROW ACTIONS
// =============================================================================

/**
 * Row Actions (Hover Actions)
 *
 * Actions appear on row hover - no additional column needed.
 * Uses the rowActions prop with TableRowActions component integration.
 *
 * Features:
 * - mode="inline" (default): Quick action buttons on hover + overflow dropdown
 * - maxQuickActions: Configure how many actions show as buttons (rest go to dropdown)
 */
export const WithRowActions: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);
    const maxQuickActions = ref(2);

    const getRowActions = (item: Product) => [
      {
        icon: "fas fa-eye",
        title: "View",
        clickHandler: () => {
          eventLog.value.unshift(`View: ${item.name}`);
          if (eventLog.value.length > 5) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-edit",
        title: "Edit",
        clickHandler: () => {
          eventLog.value.unshift(`Edit: ${item.name}`);
          if (eventLog.value.length > 5) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-copy",
        title: "Duplicate",
        clickHandler: () => {
          const newProduct = {
            ...item,
            id: Math.max(...products.value.map((p) => p.id)) + 1,
            name: `${item.name} (Copy)`,
          };
          products.value.push(newProduct);
          eventLog.value.unshift(`Duplicated: ${item.name}`);
          if (eventLog.value.length > 5) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-archive",
        title: "Archive",
        clickHandler: () => {
          eventLog.value.unshift(`Archived: ${item.name}`);
          if (eventLog.value.length > 5) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-trash",
        title: "Delete",
        variant: "danger" as const,
        clickHandler: () => {
          products.value = products.value.filter((p) => p.id !== item.id);
          eventLog.value.unshift(`Deleted: ${item.name}`);
          if (eventLog.value.length > 5) eventLog.value.pop();
        },
      },
    ];

    return { products, eventLog, getRowActions, maxQuickActions };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-neutrals-100 tw-rounded tw-text-sm">
        <div class="tw-flex tw-items-center tw-gap-4 tw-mb-3">
          <label class="tw-font-semibold">Max Quick Actions:</label>
          <select v-model.number="maxQuickActions" class="tw-border tw-rounded tw-px-2 tw-py-1">
            <option :value="1">1 (4 in dropdown)</option>
            <option :value="2">2 (3 in dropdown)</option>
            <option :value="3">3 (2 in dropdown)</option>
            <option :value="4">4 (1 in dropdown)</option>
            <option :value="5">5 (none in dropdown)</option>
          </select>
          <span class="tw-text-neutrals-500">← Change to see different configurations</span>
        </div>
        <p class="tw-font-semibold tw-mb-1">Hover over a row to see actions:</p>
        <ul class="tw-list-disc tw-list-inside">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" class="tw-text-neutrals-400">No actions yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        :row-actions="getRowActions"
        :row-actions-mode="'inline'"
        :max-quick-actions="maxQuickActions"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Row Actions with Dropdown Menu
 *
 * All actions shown in a dropdown menu triggered by three dots.
 * Uses mode="dropdown" on TableRowActions component.
 *
 * Features:
 * - Always visible three dots trigger (⋮)
 * - All actions in dropdown menu
 * - Positioned automatically using floating-ui
 * - Closes on backdrop click or Escape key
 * - Supports disabled and danger variants
 */
export const WithRowActionsDropdown: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);

    const getRowActions = (item: Product) => [
      {
        icon: "fas fa-eye",
        title: "View details",
        clickHandler: () => alert(`View: ${item.name}`),
      },
      {
        icon: "fas fa-edit",
        title: "Edit",
        clickHandler: () => alert(`Edit: ${item.name}`),
      },
      {
        icon: "fas fa-copy",
        title: "Duplicate",
        clickHandler: () => {
          const newProduct = {
            ...item,
            id: Math.max(...products.value.map((p) => p.id)) + 1,
            name: `${item.name} (Copy)`,
          };
          products.value.push(newProduct);
        },
      },
      {
        icon: "fas fa-archive",
        title: "Archive",
        disabled: item.stock === 0,
        clickHandler: () => alert(`Archive: ${item.name}`),
      },
      {
        icon: "fas fa-trash",
        title: "Delete",
        variant: "danger" as const,
        clickHandler: () => {
          if (confirm(`Delete ${item.name}?`)) {
            products.value = products.value.filter((p) => p.id !== item.id);
          }
        },
      },
    ];

    return { products, getRowActions };
  },
  template: `
    <div style="height: 400px">
      <p class="tw-mb-4 tw-text-sm tw-text-neutrals-500">
        Click the three dots (⋮) to open the actions menu.
        Archive is disabled for out-of-stock items.
      </p>
      <VcDataTable
        :items="products"
        :row-actions="getRowActions"
        row-actions-mode="dropdown"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// LINE CLAMP
// =============================================================================

/**
 * Text Line Clamp
 *
 * Demonstrates the lineClamp prop for limiting text to a specific number of lines.
 */
export const WithLineClamp: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const items = ref([
      {
        id: 1,
        title: "Short Title",
        description: "A short description.",
      },
      {
        id: 2,
        title: "Medium Length Title That Might Wrap",
        description:
          "This is a medium length description that might wrap to multiple lines depending on the column width.",
      },
      {
        id: 3,
        title: "Very Long Title That Will Definitely Need Multiple Lines to Display All the Text",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      },
    ]);

    return { items };
  },
  template: `
    <div class="tw-space-y-8">
      <div>
        <h3 class="tw-font-semibold tw-mb-2">Default (3 lines clamp)</h3>
        <div style="height: 200px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" />
            <VcColumn id="description" field="description" title="Description (default clamp)" />
          </VcDataTable>
        </div>
      </div>

      <div>
        <h3 class="tw-font-semibold tw-mb-2">Custom Line Clamp (1 line)</h3>
        <div style="height: 200px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" :line-clamp="1" />
            <VcColumn id="description" field="description" title="Description (1 line)" :line-clamp="1" />
          </VcDataTable>
        </div>
      </div>

      <div>
        <h3 class="tw-font-semibold tw-mb-2">No Line Clamp (lineClamp=0)</h3>
        <div style="height: 300px">
          <VcDataTable :items="items">
            <VcColumn id="title" field="title" title="Title" :width="200" :line-clamp="0" />
            <VcColumn id="description" field="description" title="Description (no clamp)" :line-clamp="0" />
          </VcDataTable>
        </div>
      </div>
    </div>
  `,
});

// =============================================================================
// CELL TYPES - IMAGE, LINK, HTML, DATE-AGO
// =============================================================================

/**
 * Image Cell Type
 *
 * Demonstrates the `type="image"` column for displaying product images.
 */
export const CellTypeImage: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const items = ref([
      {
        id: 1,
        name: "Laptop Pro",
        image: "https://picsum.photos/seed/laptop/80/80",
        price: 1299.99,
      },
      {
        id: 2,
        name: "Wireless Mouse",
        image: "https://picsum.photos/seed/mouse/80/80",
        price: 49.99,
      },
      {
        id: 3,
        name: "USB-C Hub",
        image: "https://picsum.photos/seed/hub/80/80",
        price: 89.99,
      },
      {
        id: 4,
        name: 'Monitor 27"',
        image: "https://picsum.photos/seed/monitor/80/80",
        price: 399.99,
      },
      {
        id: 5,
        name: "Mechanical Keyboard",
        image: "", // Empty image to show placeholder
        price: 149.99,
      },
    ]);

    return { items };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Image Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="image"</code> to display images in cells. Empty/missing images show a placeholder.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="image" field="image" title="Image" type="image" width="100px" />
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Link Cell Type
 *
 * Demonstrates the `type="link"` column for displaying clickable links.
 */
export const CellTypeLink: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const items = ref([
      {
        id: 1,
        name: "Vue.js Documentation",
        url: "https://vuejs.org/guide/introduction.html",
        category: "Documentation",
      },
      {
        id: 2,
        name: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        category: "Documentation",
      },
      {
        id: 3,
        name: "Storybook",
        url: "https://storybook.js.org/",
        category: "Tools",
      },
      {
        id: 4,
        name: "Vite",
        url: "https://vitejs.dev/",
        category: "Build Tools",
      },
      {
        id: 5,
        name: "VcShell",
        url: "https://docs.virtocommerce.org/platform/developer-guide/2.0/custom-apps-development/vc-shell/Getting-started/creating-first-custom-app/",
        category: "UI Library",
      },
    ]);

    return { items };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Link Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="link"</code> to display clickable URLs. Links open in a new tab.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="name" field="name" title="Resource Name" />
        <VcColumn id="url" field="url" title="URL" type="link" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
      </VcDataTable>
    </div>
  `,
});

/**
 * HTML Cell Type
 *
 * Demonstrates the `type="html"` column for rendering rich HTML content.
 */
export const CellTypeHtml: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const items = ref([
      {
        id: 1,
        title: "Bold Text",
        content: "<strong>This text is bold</strong> and this is normal.",
      },
      {
        id: 2,
        title: "Colored Text",
        content:
          '<span style="color: green;">Green</span>, <span style="color: red;">Red</span>, <span style="color: blue;">Blue</span>',
      },
      {
        id: 3,
        title: "List",
        content: "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
      },
      {
        id: 4,
        title: "Mixed Content",
        content:
          '<em>Italic</em>, <u>underline</u>, and <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">code</code>',
      },
      {
        id: 5,
        title: "Badge Example",
        content:
          '<span style="display: inline-block; padding: 2px 8px; background: #10B981; color: white; border-radius: 12px; font-size: 12px;">Active</span>',
      },
    ]);

    return { items };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-warning-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">HTML Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="html"</code> to render raw HTML content. <strong>Warning:</strong> Only use with trusted data to avoid XSS vulnerabilities.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="title" field="title" title="Type" width="150px" />
        <VcColumn id="content" field="content" title="HTML Content" type="html" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Date-Ago Cell Type
 *
 * Demonstrates the `type="date-ago"` column for displaying relative time (e.g., "2 hours ago").
 */
export const CellTypeDateAgo: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const now = new Date();
    const items = ref([
      {
        id: 1,
        action: "User logged in",
        timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
        user: "john.doe",
      },
      {
        id: 2,
        action: "Order placed",
        timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        user: "jane.smith",
      },
      {
        id: 3,
        action: "Product updated",
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        user: "admin",
      },
      {
        id: 4,
        action: "Comment added",
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        user: "support",
      },
      {
        id: 5,
        action: "Report generated",
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        user: "system",
      },
    ]);

    return { items };
  },
  template: `
    <div style="height: 400px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Date-Ago Cell Type</p>
        <p class="tw-text-neutrals-600">Use <code>type="date-ago"</code> to display relative timestamps like "2 minutes ago", "3 hours ago", etc.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="action" field="action" title="Action" />
        <VcColumn id="user" field="user" title="User" width="150px" />
        <VcColumn id="timestamp" field="timestamp" title="When" type="date-ago" width="180px" />
      </VcDataTable>
    </div>
  `,
});

/**
 * All Cell Types Combined
 *
 * Demonstrates all available cell types in a single table.
 */
export const AllCellTypes: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const now = new Date();
    const items = ref([
      {
        id: 1,
        image: "https://picsum.photos/seed/p1/60/60",
        name: "Premium Laptop",
        description: "<strong>High-performance</strong> laptop with <em>16GB RAM</em>",
        price: 1299.99,
        currency: "USD",
        stock: 45,
        url: "https://example.com/laptop",
        isActive: true,
        status: "In Stock",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        image: "https://picsum.photos/seed/p2/60/60",
        name: "Wireless Mouse",
        description: "<span style='color: gray;'>Ergonomic design</span> for comfort",
        price: 49.99,
        currency: "EUR",
        stock: 120,
        url: "https://example.com/mouse",
        isActive: true,
        status: "In Stock",
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        id: 3,
        image: "https://picsum.photos/seed/p3/60/60",
        name: "USB-C Hub",
        description: "<code>7-in-1</code> connectivity hub",
        price: 89.99,
        currency: "USD",
        stock: 0,
        url: "https://example.com/hub",
        isActive: false,
        status: "Out of Stock",
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    return { items };
  },
  template: `
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">All Cell Types</p>
        <p class="tw-text-neutrals-600">This table demonstrates all available cell types: text, number, money, date, datetime, date-ago, image, link, html, status, and status-icon.</p>
      </div>
      <VcDataTable :items="items">
        <VcColumn id="image" field="image" title="Image" type="image" width="80px" />
        <VcColumn id="name" field="name" title="Name (text)" width="150px" />
        <VcColumn id="description" field="description" title="Description (html)" type="html" />
        <VcColumn id="price" field="price" title="Price (money)" type="money" currency-field="currency" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock (number)" type="number" width="100px" />
        <VcColumn id="url" field="url" title="URL (link)" type="link" width="180px" :line-clamp="1"/>
        <VcColumn id="isActive" field="isActive" title="Active" type="status-icon" width="80px" />
        <VcColumn id="status" field="status" title="Status" type="status" width="120px" />
        <VcColumn id="createdAt" field="createdAt" title="Created (date)" type="date" width="120px" />
        <VcColumn id="updatedAt" field="updatedAt" title="Updated (date-ago)" type="date-ago" width="140px" />
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// COLUMN SWITCHER
// =============================================================================




/**
 * Built-in Column Switcher — Auto Mode (via prop)
 *
 * Uses `column-switcher` (defaults to 'auto') to show declared VcColumns +
 * auto-discovered columns from item data keys. The switcher shows all possible
 * columns: declared ones start visible, data-derived ones start hidden.
 * Only 3 columns are declared — the remaining keys (id, currency, isActive, createdAt)
 * are auto-discovered and can be toggled on via the switcher.
 */
export const BuiltInColumnSwitcher: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    return { products };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Built-in Column Switcher (Auto)</p>
        <p class="tw-text-neutrals-600">
          Only 3 columns are declared (<code>name</code>, <code>price</code>, <code>stock</code>).
          The switcher auto-discovers remaining fields from data:
          <code>id</code>, <code>currency</code>, <code>status</code>,
          <code>isActive</code>, <code>createdAt</code>.
          Toggle them on to see them appear in the table.
        </p>
      </div>

      <VcDataTable
        :items="products"
        column-switcher
        searchable
        search-placeholder="Search products..."
        @search="(v) => console.log('search:', v)"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
      </VcDataTable>
    </div>
  `,
});

/**
 * Column Switcher — Defined Mode
 *
 * Uses `column-switcher="defined"` to only show declared VcColumns in the switcher.
 * No auto-discovery from data keys.
 */
export const ColumnSwitcherDefined: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    return { products };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Column Switcher (Defined Mode)</p>
        <p class="tw-text-neutrals-600">
          Only declared VcColumns appear in the switcher — no auto-discovered columns.
        </p>
      </div>

      <VcDataTable
        :items="products"
        column-switcher="defined"
        searchable
        search-placeholder="Search products..."
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
        <VcColumn id="status" field="status" title="Status" width="120px" />
        <VcColumn id="createdAt" field="createdAt" title="Created" type="date" width="150px" />
        <VcColumn id="currency" field="currency" title="Currency" width="100px" />
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// ROW GROUPING
// =============================================================================

/**
 * Row Grouping by Status
 *
 * Demonstrates grouping rows by a field value within a single table.
 * Groups can be expanded/collapsed.
 */
export const WithRowGrouping: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const expandedGroups = ref<string[]>(["In Stock", "Low Stock", "Out of Stock"]);

    return { products, expandedGroups };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping</p>
        <p class="tw-text-neutrals-600">Products are grouped by their status in a single table. Click group headers to expand/collapse.</p>
        <p class="tw-text-neutrals-500 tw-mt-1">Expanded groups: {{ expandedGroups.join(', ') }}</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="true"
        v-model:expanded-row-groups="expandedGroups"
        @rowgroup-expand="(e) => console.log('Group expanded:', e.data)"
        @rowgroup-collapse="(e) => console.log('Group collapsed:', e.data)"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>
      </VcDataTable>
    </div>
  `,
});

/**
 * Row Grouping with Footer
 *
 * Demonstrates row grouping with a custom footer for each group.
 */
export const WithRowGroupingFooter: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const expandedGroups = ref<string[]>(["In Stock", "Low Stock", "Out of Stock"]);

    // Calculate totals per group
    const getGroupTotal = (status: string) => {
      return products.value
        .filter((p) => p.status === status)
        .reduce((sum, p) => sum + p.price, 0)
        .toFixed(2);
    };

    return { products, expandedGroups, getGroupTotal };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping with Footer</p>
        <p class="tw-text-neutrals-600">Each group has a footer showing the total price for that group.</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="true"
        v-model:expanded-row-groups="expandedGroups"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>

        <template #groupfooter="{ data }">
          <div class="tw-flex tw-justify-end tw-gap-4">
            <span class="tw-text-neutrals-600">Total for {{ data.status }}:</span>
            <span class="tw-font-semibold">\${{ getGroupTotal(data.status) }}</span>
          </div>
        </template>
      </VcDataTable>
    </div>
  `,
});

/**
 * Row Grouping Non-Expandable
 *
 * Demonstrates row grouping where groups cannot be collapsed (always expanded).
 */
export const WithRowGroupingNonExpandable: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    return { products };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Row Grouping (Non-Expandable)</p>
        <p class="tw-text-neutrals-600">Groups are always expanded and cannot be collapsed.</p>
      </div>

      <VcDataTable
        :items="products"
        group-rows-by="status"
        :expandable-row-groups="false"
      >
        <VcColumn id="name" field="name" title="Name" width="200px" />
        <VcColumn id="category" field="category" title="Category" width="150px" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />

        <template #groupheader="{ data }">
          <span
            class="tw-inline-block tw-w-3 tw-h-3 tw-rounded-full tw-mr-2"
            :class="{
              'tw-bg-success-500': data.status === 'In Stock',
              'tw-bg-danger-500': data.status === 'Out of Stock',
              'tw-bg-warning-500': data.status === 'Low Stock',
            }"
          ></span>
          <span class="tw-font-semibold">{{ data.status }}</span>
        </template>
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// INFINITE SCROLL
// =============================================================================

/**
 * Infinite Scroll
 *
 * Demonstrates loading more data as the user scrolls near the bottom of the table.
 * Uses `infinite-scroll` prop + `@load-more` event. Pagination prop remains as an alternative.
 */
export const InfiniteScroll: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const PAGE_SIZE = 20;
    let nextId = 1;

    const generatePage = (count: number) => {
      const statuses = ["In Stock", "Out of Stock", "Low Stock"];
      return Array.from({ length: count }, () => ({
        id: nextId++,
        name: `Product ${nextId - 1}`,
        price: Math.round(Math.random() * 1000 * 100) / 100,
        currency: "USD",
        stock: Math.floor(Math.random() * 200),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        isActive: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }));
    };

    const products = ref(generatePage(PAGE_SIZE));
    const loading = ref(false);
    const hasMore = ref(true);
    const loadCount = ref(0);

    const loadMore = () => {
      if (loading.value || !hasMore.value) return;
      loading.value = true;
      loadCount.value++;
      // Simulate async fetch
      setTimeout(() => {
        const newItems = generatePage(PAGE_SIZE);
        products.value = [...products.value, ...newItems];
        loading.value = false;
        // Stop after 5 pages (100 items total)
        if (products.value.length >= 100) {
          hasMore.value = false;
        }
      }, 800);
    };

    return { products, loading, hasMore, loadMore, loadCount };
  },
  template: `
    <div>
      <div class="tw-mb-2 tw-text-sm tw-text-neutrals-500">
        Loaded: {{ products.length }} items | Fetches: {{ loadCount }} | {{ hasMore ? 'Scroll down to load more...' : 'All items loaded' }}
      </div>
      <VcDataTable
        :items="products"
        :loading="loading"
        :infinite-scroll="hasMore"
        :infinite-scroll-distance="150"
        scroll-height="400px"
        @load-more="loadMore"
      >
        <VcColumn id="id" field="id" title="ID" width="80px" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" width="120px" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" width="100px" />
        <VcColumn id="status" field="status" title="Status" type="status" width="120px" />
      </VcDataTable>
    </div>
  `,
});

// =============================================================================
// MOBILE VIEW
// =============================================================================

/**
 * Mobile View Info
 *
 * Real mobile card view with images. Uses `withMobileView` decorator
 * to inject `isMobile = true`, triggering the actual mobile layout.
 *
 * - `mobile-role="image"` - Product thumbnail on the left
 * - `mobile-role="title"` - Product name as primary identifier
 * - `mobile-role="field"` - Price and Stock as labeled fields
 * - `mobile-role="status"` - Status badge at bottom
 *
 * **Note:** View this story on a mobile viewport (375px) to see the full effect.
 */
export const MobileViewInfo: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    // Extend products with thumbnail images
    interface ProductWithImage extends Product {
      thumbnail: string;
    }
    const products: ProductWithImage[] = mockProducts.map((p) => ({
      ...p,
      thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
    }));
    return { products };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Mobile View</strong>
        <span style="color: #64748b; font-size: 12px;"> (Real mobile layout with images)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileViewInfo.decorators = [withMobileView];
MobileViewInfo.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Real mobile card view with product images. Uses `withMobileView` decorator to activate mobile layout. Shows image on left, title at top, price/stock as labeled fields, and status badge at bottom.",
    },
  },
};

// ============================================================================
// MOBILE CARD VIEW STORIES
// ============================================================================

/**
 * Mobile Card View - New mobileRole API (Recommended)
 *
 * VcDataTable automatically switches to mobile card view on small screens.
 * Use `mobileRole` on VcColumn for semantic roles:
 *
 * - `title`: Primary identifier (full width, bold)
 * - `image`: Visual element (left side)
 * - `field`: Data with label (auto-distributed in 2x2 grid, max 4)
 * - `status`: Status badge (multiple allowed, bottom row)
 *
 * Fields are auto-placed in 2x2 grid (top-left, top-right, bottom-left, bottom-right).
 * Use `mobilePosition` to override auto-placement if needed.
 *
 * **Note:** View this story on a mobile viewport (375px) to see the mobile layout.
 */
export const MobileCardView: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Mobile View Preview</strong>
        <span style="color: #64748b; font-size: 12px;"> (New mobileRole API)</span>
      </div>
      <VcDataTable :items="products">
        <!-- Desktop only (no mobileRole) -->
        <VcColumn id="id" field="id" title="ID" />

        <!-- Mobile configured with mobileRole -->
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileCardView.decorators = [withMobileView];
MobileCardView.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Mobile card view using new `mobileRole` API. Title at top (bold), fields in 2-column grid with labels, status badges at bottom.",
    },
  },
};

/**
 * Mobile Card View with Swipe Actions
 *
 * Swipe left on a card to reveal row actions (iOS-style).
 * Shows up to 2 actions directly, with a "More" button for additional actions.
 */
export const MobileWithSwipeActions: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);

    const getRowActions = (item: Product) => [
      {
        icon: "fas fa-edit",
        title: "Edit",
        type: "success" as const,
        clickHandler: () => {
          eventLog.value.unshift(`Edit: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-trash",
        title: "Delete",
        type: "danger" as const,
        clickHandler: () => {
          products.value = products.value.filter((p) => p.id !== item.id);
          eventLog.value.unshift(`Deleted: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
    ];

    return { products, eventLog, getRowActions };
  },
  template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Swipe Actions Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">← Swipe left on a card to reveal actions</div>
      </div>
      <div v-if="eventLog.length" style="background: #fef3c7; padding: 8px 12px; font-size: 12px;">
        <strong>Recent:</strong> {{ eventLog.join(' • ') }}
      </div>
      <div style="height: 500px;">
        <VcDataTable :items="products" :row-actions="getRowActions">
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
});
MobileWithSwipeActions.decorators = [withMobileView];
MobileWithSwipeActions.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "iOS-style swipe actions. Swipe left to reveal Edit and Delete buttons. Uses spring physics for natural feel.",
    },
  },
};

/**
 * Mobile Card View with Many Actions (Action Sheet)
 *
 * When there are more than 2 actions, a "More" button appears that opens
 * an iOS-style action sheet with all available actions.
 */
export const MobileWithManyActions: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const eventLog = ref<string[]>([]);

    const getRowActions = (item: Product) => [
      {
        icon: "fas fa-eye",
        title: "View",
        clickHandler: () => {
          eventLog.value.unshift(`View: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-edit",
        title: "Edit",
        type: "success" as const,
        clickHandler: () => {
          eventLog.value.unshift(`Edit: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-copy",
        title: "Duplicate",
        clickHandler: () => {
          eventLog.value.unshift(`Duplicate: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-archive",
        title: "Archive",
        type: "warning" as const,
        clickHandler: () => {
          eventLog.value.unshift(`Archive: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
      {
        icon: "fas fa-trash",
        title: "Delete",
        type: "danger" as const,
        clickHandler: () => {
          products.value = products.value.filter((p) => p.id !== item.id);
          eventLog.value.unshift(`Deleted: ${item.name}`);
          if (eventLog.value.length > 3) eventLog.value.pop();
        },
      },
    ];

    return { products, eventLog, getRowActions };
  },
  template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Action Sheet Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Swipe → tap "More" to see action sheet</div>
      </div>
      <div v-if="eventLog.length" style="background: #fef3c7; padding: 8px 12px; font-size: 12px;">
        <strong>Recent:</strong> {{ eventLog.join(' • ') }}
      </div>
      <div style="height: 500px;">
        <VcDataTable :items="products" :row-actions="getRowActions">
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
});
MobileWithManyActions.decorators = [withMobileView];
MobileWithManyActions.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "With 5 actions, swipe shows 2 + 'More' button. Tap 'More' to open iOS-style action sheet.",
    },
  },
};

/**
 * Mobile Card View with Selection
 *
 * **How it works:**
 * 1. **Long-press** (hold ~500ms) on any card to start selection mode
 * 2. Once in selection mode, **checkboxes appear** on all cards
 * 3. Tap cards or checkboxes to toggle selection
 * 4. Click "Clear" button to exit selection mode
 *
 * This saves screen space by hiding checkboxes until selection is needed.
 */
export const MobileWithSelection: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const selection = ref<Product[]>([]);
    const clearSelection = () => {
      selection.value = [];
    };
    return { products: mockProducts, selection, clearSelection };
  },
  template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Selection Demo</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              {{ selection.length > 0 ? selection.length + ' selected' : 'Long-press to select' }}
            </div>
          </div>
          <VcButton
            v-if="selection.length > 0"
            variant="outline"
            size="s"
            @click="clearSelection"
          >
            Clear
          </VcButton>
        </div>
      </div>
      <div style="height: 500px;">
        <VcDataTable
          :items="products"
          v-model:selection="selection"
          selection-mode="multiple"
        >
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
});
MobileWithSelection.decorators = [withMobileView];
MobileWithSelection.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Long-press (hold 500ms) on any card to activate selection mode. Checkboxes appear only when selection is active. Tap cards or checkboxes to toggle. Clear button exits selection mode.",
    },
  },
};

/**
 * Mobile Card View with All Cell Types
 *
 * Demonstrates various cell types in mobile card layout.
 */
export const MobileAllCellTypes: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface ExtendedProduct extends Product {
      thumbnail: string;
      description: string;
      lastUpdated: Date;
    }
    const products: ExtendedProduct[] = mockProducts.map((p) => ({
      ...p,
      thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
      description: `<strong>${p.name}</strong> - A great product for your needs.`,
      lastUpdated: new Date(),
    }));
    return { products };
  },
  template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Cell Types Demo</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          Various data types rendered in mobile cards
        </div>
      </div>
      <div style="height: 600px;">
        <VcDataTable :items="products">
          <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="lastUpdated" field="lastUpdated" title="Updated" type="date-ago" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        </VcDataTable>
      </div>
    </div>
  `,
});
MobileAllCellTypes.decorators = [withMobileView];
MobileAllCellTypes.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Demonstrates image, money, date-ago, and number cell types in mobile card layout with new mobileRole API.",
    },
  },
};

// ============================================================================
// UNIVERSAL MOBILE CARD EXAMPLES
// ============================================================================

/**
 * Mobile Card View - Users (Universal Example)
 *
 * Demonstrates that mobile card layout works for ANY data type, not just products.
 * This example shows a user list with email, role, and active status.
 */
export const MobileUsers: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }
    const users: User[] = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        isActive: true,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Editor",
        isActive: true,
        createdAt: new Date("2024-02-20"),
      },
      {
        id: 3,
        name: "Bob Wilson",
        email: "bob@example.com",
        role: "Viewer",
        isActive: false,
        createdAt: new Date("2024-03-10"),
      },
      {
        id: 4,
        name: "Alice Brown",
        email: "alice@example.com",
        role: "Editor",
        isActive: true,
        createdAt: new Date("2024-04-05"),
      },
      {
        id: 5,
        name: "Charlie Davis",
        email: "charlie@example.com",
        role: "Admin",
        isActive: true,
        createdAt: new Date("2024-05-12"),
      },
    ];
    return { users };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Users List</strong>
        <span style="color: #64748b; font-size: 12px;"> (Universal mobile layout)</span>
      </div>
      <VcDataTable :items="users">
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="email" field="email" title="Email" mobile-role="field" />
        <VcColumn id="role" field="role" title="Role" mobile-role="field" />
        <VcColumn id="createdAt" field="createdAt" title="Joined" type="date-ago" mobile-role="field" />
        <VcColumn id="isActive" field="isActive" title="Status" type="status-icon" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileUsers.decorators = [withMobileView];
MobileUsers.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Universal mobile layout for Users data. Shows name as title, email/role/date as labeled fields, and status badge.",
    },
  },
};

/**
 * Mobile Card View - Documents/Pages (Universal Example)
 *
 * Minimal card layout for documents or pages - just title and metadata fields.
 * No image, no status - demonstrates flexibility.
 */
export const MobileDocuments: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface Document {
      id: number;
      title: string;
      author: string;
      category: string;
      lastModified: Date;
    }
    const documents: Document[] = [
      {
        id: 1,
        title: "Homepage Design Spec",
        author: "Jane Smith",
        category: "Design",
        lastModified: new Date("2025-01-28"),
      },
      {
        id: 2,
        title: "API Documentation",
        author: "John Doe",
        category: "Technical",
        lastModified: new Date("2025-01-25"),
      },
      {
        id: 3,
        title: "Marketing Strategy Q1",
        author: "Alice Brown",
        category: "Marketing",
        lastModified: new Date("2025-01-20"),
      },
      {
        id: 4,
        title: "User Research Report",
        author: "Bob Wilson",
        category: "Research",
        lastModified: new Date("2025-01-15"),
      },
      {
        id: 5,
        title: "Product Roadmap 2025",
        author: "Charlie Davis",
        category: "Planning",
        lastModified: new Date("2025-01-10"),
      },
    ];
    return { documents };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Documents</strong>
        <span style="color: #64748b; font-size: 12px;"> (Minimal card - no image/status)</span>
      </div>
      <VcDataTable :items="documents">
        <VcColumn id="title" field="title" title="Title" mobile-role="title" />
        <VcColumn id="author" field="author" title="Author" mobile-role="field" />
        <VcColumn id="category" field="category" title="Category" mobile-role="field" />
        <VcColumn id="lastModified" field="lastModified" title="Modified" type="date-ago" mobile-role="field" />
      </VcDataTable>
    </div>
  `,
});
MobileDocuments.decorators = [withMobileView];
MobileDocuments.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Minimal mobile layout for documents - title and labeled fields, no image or status. Shows layout flexibility.",
    },
  },
};

/**
 * Mobile Card View - Orders (Universal Example)
 *
 * E-commerce orders with order number, customer, total, and status.
 * Demonstrates multiple statuses (order status + payment status).
 */
export const MobileOrders: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface Order {
      id: number;
      orderNumber: string;
      customer: string;
      total: number;
      itemCount: number;
      status: string;
      paymentStatus: string;
      createdAt: Date;
    }
    const orders: Order[] = [
      {
        id: 1,
        orderNumber: "ORD-2025-001",
        customer: "John Doe",
        total: 299.99,
        itemCount: 3,
        status: "Shipped",
        paymentStatus: "Paid",
        createdAt: new Date("2025-01-28"),
      },
      {
        id: 2,
        orderNumber: "ORD-2025-002",
        customer: "Jane Smith",
        total: 149.5,
        itemCount: 2,
        status: "Processing",
        paymentStatus: "Paid",
        createdAt: new Date("2025-01-27"),
      },
      {
        id: 3,
        orderNumber: "ORD-2025-003",
        customer: "Bob Wilson",
        total: 599.0,
        itemCount: 5,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date("2025-01-26"),
      },
      {
        id: 4,
        orderNumber: "ORD-2025-004",
        customer: "Alice Brown",
        total: 89.99,
        itemCount: 1,
        status: "Delivered",
        paymentStatus: "Paid",
        createdAt: new Date("2025-01-25"),
      },
      {
        id: 5,
        orderNumber: "ORD-2025-005",
        customer: "Charlie Davis",
        total: 1299.0,
        itemCount: 4,
        status: "Cancelled",
        paymentStatus: "Refunded",
        createdAt: new Date("2025-01-24"),
      },
    ];
    return { orders };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Orders</strong>
        <span style="color: #64748b; font-size: 12px;"> (Multiple statuses)</span>
      </div>
      <VcDataTable :items="orders">
        <VcColumn id="orderNumber" field="orderNumber" title="Order" mobile-role="title" />
        <VcColumn id="customer" field="customer" title="Customer" mobile-role="field" />
        <VcColumn id="total" field="total" title="Total" type="money" mobile-role="field" />
        <VcColumn id="itemCount" field="itemCount" title="Items" type="number" mobile-role="field" />
        <VcColumn id="createdAt" field="createdAt" title="Date" type="date-ago" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        <VcColumn id="paymentStatus" field="paymentStatus" title="Payment" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileOrders.decorators = [withMobileView];
MobileOrders.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "Orders with multiple status badges (order status + payment status). Only first 4 fields shown in grid.",
    },
  },
};

/**
 * Mobile Card View - Products with Multiple Statuses
 *
 * Demonstrates multiple status badges for a single row (status + isPublished).
 * Shows the full power of the universal layout.
 */
export const MobileProductsWithMultipleStatuses: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface ExtendedProduct extends Product {
      thumbnail: string;
      isPublished: boolean;
      gtin: string;
    }
    const products: ExtendedProduct[] = mockProducts.map((p, i) => ({
      ...p,
      thumbnail: `https://picsum.photos/seed/${p.id}/100/100`,
      isPublished: i % 2 === 0,
      gtin: `8901234567890${p.id}`,
    }));
    return { products };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Products (Extended)</strong>
        <span style="color: #64748b; font-size: 12px;"> (Image + Multiple Statuses)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="thumbnail" field="thumbnail" title="Image" type="image" mobile-role="image" />
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="gtin" field="gtin" title="GTIN" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        <VcColumn id="isPublished" field="isPublished" title="Published" type="status-icon" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileProductsWithMultipleStatuses.decorators = [withMobileView];
MobileProductsWithMultipleStatuses.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story: "Products with image, title, 3 fields (Price, Stock, GTIN - only first 4 shown), and 2 status badges.",
    },
  },
};

/**
 * Mobile Card View - Legacy mobilePosition API (Backward Compatibility)
 *
 * The old `mobilePosition` API still works for backward compatibility.
 * First `top-left` becomes title, others become fields with labels.
 */
export const MobileLegacyAPI: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    return { products: mockProducts };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #fef3c7; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Legacy mobilePosition API</strong>
        <span style="color: #92400e; font-size: 12px;"> (Backward compatible)</span>
      </div>
      <VcDataTable :items="products">
        <!-- Using legacy mobilePosition instead of mobileRole -->
        <VcColumn id="name" field="name" title="Name" mobile-position="top-left" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-position="top-right" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-position="bottom-left" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-position="status" />
      </VcDataTable>
    </div>
  `,
});
MobileLegacyAPI.decorators = [withMobileView];
MobileLegacyAPI.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Legacy `mobilePosition` API for backward compatibility. First `top-left` becomes title, others become labeled fields.",
    },
  },
};

/**
 * Mobile Card View - Two Statuses Demo
 *
 * Demonstrates displaying multiple status badges in a single card.
 * Both statuses appear in a row at the bottom of the card.
 */
export const MobileTwoStatuses: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    interface ProductWithStatuses {
      id: number;
      name: string;
      price: number;
      stockStatus: string;
      publishStatus: string;
    }
    const products: ProductWithStatuses[] = [
      { id: 1, name: "Laptop Pro", price: 1299.99, stockStatus: "In Stock", publishStatus: "Published" },
      { id: 2, name: "Wireless Mouse", price: 49.99, stockStatus: "Low Stock", publishStatus: "Draft" },
      { id: 3, name: "USB-C Hub", price: 79.99, stockStatus: "Out of Stock", publishStatus: "Published" },
      { id: 4, name: "Mechanical Keyboard", price: 149.99, stockStatus: "In Stock", publishStatus: "Archived" },
      { id: 5, name: "Monitor Stand", price: 89.99, stockStatus: "In Stock", publishStatus: "Published" },
    ];
    return { products };
  },
  template: `
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #ecfdf5; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Two Statuses Demo</strong>
        <span style="color: #065f46; font-size: 12px;"> (Stock + Publish status)</span>
      </div>
      <VcDataTable :items="products">
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <!-- Two status columns - both will appear in bottom row -->
        <VcColumn id="stockStatus" field="stockStatus" title="Stock" type="status" mobile-role="status" />
        <VcColumn id="publishStatus" field="publishStatus" title="Publish" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
});
MobileTwoStatuses.decorators = [withMobileView];
MobileTwoStatuses.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        'Two status badges displayed in a row at the bottom: Stock Status + Publish Status. Both use `mobile-role="status"`.',
    },
  },
};

/**
 * Mobile Pull-to-Refresh
 *
 * Demonstrates pull-to-refresh functionality on mobile view.
 * Pull down on the card list to trigger a refresh.
 * Uses spring physics animation for natural feel.
 */
export const MobilePullToRefresh: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const loading = ref(false);
    const refreshCount = ref(0);

    const handleRefresh = () => {
      loading.value = true;
      refreshCount.value++;
      // Simulate network request
      setTimeout(() => {
        // Simulate adding new item at the top
        const newProduct = {
          id: Date.now(),
          name: `New Product ${refreshCount.value}`,
          price: Math.floor(Math.random() * 200) + 50,
          stock: Math.floor(Math.random() * 100),
          status: "Active",
        };
        products.value = [newProduct, ...products.value.slice(0, 4)];
        loading.value = false;
      }, 1500);
    };

    return { products, loading, refreshCount, handleRefresh };
  },
  template: `
    <div style="max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f0f9ff; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Pull-to-Refresh Demo</strong>
        <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
          ↓ Pull down to refresh (Refreshed {{ refreshCount }} times)
        </div>
      </div>
      <div style="height: 500px; overflow: hidden;">
        <VcDataTable
          :items="products"
          :loading="loading"
          :pull-to-refresh="true"
          @pull-refresh="handleRefresh"
        >
          <VcColumn id="name" field="name" title="Name" mobile-role="title" />
          <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
          <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
        </VcDataTable>
      </div>
    </div>
  `,
});
MobilePullToRefresh.decorators = [withMobileView];
MobilePullToRefresh.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Pull down on the card list to trigger refresh. Uses spring physics animation. Shows loading indicator while refreshing. New item is added to demonstrate data update.",
    },
  },
};

/**
 * Select All with Pagination
 *
 * Demonstrates the "Select All" API for tables with pagination.
 * When all visible items are selected and totalCount > items.length,
 * a banner appears allowing selection of ALL items including non-loaded ones.
 *
 * The parent component controls how to handle bulk operations when selectAllActive is true.
 */
export const SelectAllWithPagination: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const tableRef = ref<any>(null);

    // Simulate paginated data (page 1 of 10)
    const pageSize = 5;
    const totalCount = 50;
    const currentPage = ref(1);

    // Generate mock data for current page
    const generatePageData = (page: number) => {
      const start = (page - 1) * pageSize;
      return Array.from({ length: pageSize }, (_, i) => ({
        id: start + i + 1,
        name: `Product ${start + i + 1}`,
        price: Math.floor(Math.random() * 200) + 50,
        stock: Math.floor(Math.random() * 100),
        status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
      }));
    };

    const items = ref(generatePageData(1));
    const selection = ref<typeof items.value>([]);
    const isSelectAllActive = ref(false);
    const actionLog = ref<string[]>([]);

    // Handle select all event from table
    const handleSelectAll = (event: { selected: boolean }) => {
      if (event.selected) {
        actionLog.value.unshift(`SELECT ALL triggered - would select all ${totalCount} items`);
      } else {
        actionLog.value.unshift("SELECT ALL cleared");
      }
      if (actionLog.value.length > 3) actionLog.value.pop();
    };

    // Simulate bulk delete
    const handleBulkDelete = () => {
      const state = tableRef.value?.getSelectionState();
      if (state?.isSelectAll) {
        actionLog.value.unshift(`DELETE ALL ${totalCount} items (server-side)`);
      } else {
        actionLog.value.unshift(`DELETE ${state?.count ?? 0} selected items`);
      }
      if (actionLog.value.length > 3) actionLog.value.pop();

      // Clear selection after action
      tableRef.value?.clearSelection();
    };

    // Programmatic select all
    const triggerSelectAll = () => {
      tableRef.value?.selectAll();
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageClick = (page: number) => {
      currentPage.value = page;
      items.value = generatePageData(page);
      selection.value = [];
      isSelectAllActive.value = false;
    };

    return {
      tableRef,
      items,
      selection,
      isSelectAllActive,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      actionLog,
      handleSelectAll,
      handleBulkDelete,
      triggerSelectAll,
      handlePageClick,
    };
  },
  template: `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: #f0f9ff; padding: 12px 16px; border-radius: 8px 8px 0 0; border: 1px solid #bae6fd;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>Select All with Pagination Demo</strong>
            <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
              Page {{ currentPage }} of {{ totalPages }} • Showing {{ pageSize }} of {{ totalCount }} items
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click="triggerSelectAll"
              style="padding: 6px 12px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;"
            >
              Select All {{ totalCount }}
            </button>
            <button
              v-if="selection.length > 0 || isSelectAllActive"
              @click="handleBulkDelete"
              style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;"
            >
              Delete {{ isSelectAllActive ? totalCount : selection.length }} Items
            </button>
          </div>
        </div>
      </div>

      <!-- Selection Banner is now built into VcDataTable -->

      <!-- Action Log -->
      <div v-if="actionLog.length" style="background: #f1f5f9; padding: 8px 16px; font-size: 12px; color: #475569; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
        <strong>Log:</strong> {{ actionLog.join(' → ') }}
      </div>

      <div style="height: 350px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden;">
        <VcDataTable
          ref="tableRef"
          :items="items"
          v-model:selection="selection"
          v-model:select-all-active="isSelectAllActive"
          :total-count="totalCount"
          :pagination="{ currentPage, pages: totalPages }"
          selection-mode="multiple"
          @select-all="handleSelectAll"
          @pagination-click="handlePageClick"
        >
          <VcColumn id="name" field="name" title="Product Name" />
          <VcColumn id="price" field="price" title="Price" type="money" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" />
          <VcColumn id="status" field="status" title="Status" type="status" />
        </VcDataTable>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;">
        <strong>API Usage:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li><code>:total-count="50"</code> - Total items across all pages</li>
          <li><code>v-model:select-all-active</code> - Two-way bind "select all" state</li>
          <li><code>@select-all</code> - Event when "select all" mode changes</li>
          <li><code>tableRef.selectAll()</code> - Programmatic select all</li>
          <li><code>tableRef.clearSelection()</code> - Clear all selections</li>
          <li><code>tableRef.getSelectionState()</code> - Get selection info for bulk ops</li>
          <li><code>#selection-banner</code> - Slot to customize the built-in selection banner</li>
        </ul>
      </div>
    </div>
  `,
});
SelectAllWithPagination.parameters = {
  docs: {
    description: {
      story:
        "Select All API for paginated tables. When all visible items are selected and totalCount > items.length, a banner appears. Use `tableRef.getSelectionState()` to determine if bulk operation should target selected items or ALL items.",
    },
  },
};

// ============================================================================
// Row CRUD Stories
// ============================================================================

/**
 * Basic Add/Remove Rows functionality with built-in add button
 */
export const AddRemoveRows: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const tableRef = ref<any>(null);

    // Start with some initial data
    const items = ref([
      { id: 1, name: "Product A", price: 99.99, stock: 50 },
      { id: 2, name: "Product B", price: 149.99, stock: 30 },
      { id: 3, name: "Product C", price: 199.99, stock: 20 },
    ]);

    let nextId = 4;
    const actionLog = ref<string[]>([]);

    // Handle row-add event (customize defaults)
    const handleRowAdd = (event: { defaults: Record<string, unknown>; cancel: () => void }) => {
      event.defaults.id = nextId++;
      event.defaults.name = `New Product ${nextId - 1}`;
      event.defaults.price = 0;
      event.defaults.stock = 0;
      actionLog.value.unshift(`Added row with id ${event.defaults.id}`);
      if (actionLog.value.length > 5) actionLog.value.pop();
    };

    // Handle row-remove event
    const handleRowRemove = (event: { data: (typeof items.value)[0]; index: number; cancel: () => void }) => {
      actionLog.value.unshift(`Removed "${event.data.name}" at index ${event.index}`);
      if (actionLog.value.length > 5) actionLog.value.pop();
    };

    // Programmatic add
    const addCustomRow = () => {
      tableRef.value?.addRow({
        id: nextId++,
        name: "Custom Added Product",
        price: 299.99,
        stock: 100,
      });
    };

    // Row actions with delete
    const getRowActions = (item: (typeof items.value)[0], index: number) => [
      {
        id: "delete",
        title: "Delete",
        icon: "fas fa-trash",
        variant: "danger" as const,
        clickHandler: () => {
          tableRef.value?.removeRow(index);
        },
      },
    ];

    return {
      tableRef,
      items,
      actionLog,
      handleRowAdd,
      handleRowRemove,
      addCustomRow,
      getRowActions,
    };
  },
  template: `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: #f0f9ff; padding: 12px 16px; border-radius: 8px 8px 0 0; border: 1px solid #bae6fd;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>Add/Remove Rows Demo</strong>
            <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
              {{ items.length }} items • Built-in add button at footer
            </div>
          </div>
          <VcButton @click="addCustomRow" variant="primary" small>
            Add Custom Row (Programmatic)
          </VcButton>
        </div>
      </div>

      <!-- Action Log -->
      <div v-if="actionLog.length" style="background: #f1f5f9; padding: 8px 16px; font-size: 12px; color: #475569; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
        <strong>Log:</strong> {{ actionLog.join(' → ') }}
      </div>

      <div style="height: 300px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden;">
        <VcDataTable
          ref="tableRef"
          :items="items"
          :add-row="{ enabled: true, position: 'footer', label: 'Add Product', icon: 'fas fa-plus' }"
          :row-actions="getRowActions"
          @row-add="handleRowAdd"
          @row-remove="handleRowRemove"
        >
          <VcColumn id="name" field="name" title="Product Name" />
          <VcColumn id="price" field="price" title="Price" type="money" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" />
        </VcDataTable>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;">
        <strong>API Usage:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li><code>:add-row="{ enabled: true, position: 'footer' }"</code> - Show add button at footer</li>
          <li><code>@row-add</code> - Customize defaults before row is added</li>
          <li><code>@row-remove</code> - Handle row removal (can be cancelled)</li>
          <li><code>tableRef.addRow(defaults)</code> - Programmatic add</li>
          <li><code>tableRef.removeRow(index)</code> - Programmatic remove</li>
        </ul>
      </div>
    </div>
  `,
});
AddRemoveRows.parameters = {
  docs: {
    description: {
      story:
        "Add and remove rows with built-in add button. Use @row-add to customize defaults and @row-remove to handle removal. Row actions with delete button demonstrate programmatic removal.",
    },
  },
};

/**
 * Inline editing with validation
 */
export const InlineEditingWithValidation: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton, VcInput },
  setup() {
    const tableRef = ref<any>(null);

    const items = ref([
      { id: 1, name: "Product A", price: 99.99, stock: 50 },
      { id: 2, name: "Product B", price: 149.99, stock: 30 },
      { id: 3, name: "Product C", price: 199.99, stock: 20 },
    ]);

    const isEditing = ref(false);
    const actionLog = ref<string[]>([]);

    // Note: Validation is now handled via VeeValidate rules on VcColumn
    // Example: <VcColumn :rules="{ required: true, min: 3 }" />

    const startEditing = () => {
      tableRef.value?.startEditing();
      isEditing.value = true;
    };

    const saveChanges = async () => {
      await tableRef.value?.saveChanges();
      isEditing.value = false;
    };

    const cancelEditing = () => {
      tableRef.value?.cancelEditing();
      isEditing.value = false;
    };

    const handleEditSave = (event: { changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> }) => {
      actionLog.value.unshift(`Saved ${event.changes.length} change(s)`);
      if (actionLog.value.length > 5) actionLog.value.pop();
    };

    const handleEditCancel = () => {
      actionLog.value.unshift("Cancelled editing");
      if (actionLog.value.length > 5) actionLog.value.pop();
    };

    // Reactive state tracking from tableRef using polling
    // Note: Vue template refs don't create reactive subscriptions to exposed computed refs,
    // so we poll the state at a reasonable interval for the demo
    const editingIsDirty = ref(false);
    const editingIsValid = ref(true);
    const editingChangesCount = ref(0);
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const updateEditState = () => {
      // Vue auto-unwraps refs exposed via defineExpose when accessed through template ref
      // So tableRef.value?.isDirty returns the value directly, not a Ref
      const isDirtyVal = tableRef.value?.isDirty;
      const isValidVal = tableRef.value?.isValid;
      const pendingChangesVal = tableRef.value?.pendingChanges;

      editingIsDirty.value = isDirtyVal ?? false;
      editingIsValid.value = isValidVal ?? true;
      editingChangesCount.value = pendingChangesVal?.length ?? 0;
    };

    onMounted(() => {
      pollInterval = setInterval(updateEditState, 100);
    });

    onUnmounted(() => {
      if (pollInterval) clearInterval(pollInterval);
    });

    return {
      tableRef,
      items,
      isEditing,
      actionLog,
      startEditing,
      saveChanges,
      cancelEditing,
      handleEditSave,
      handleEditCancel,
      editingIsDirty,
      editingIsValid,
      editingChangesCount,
    };
  },
  template: `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: #f0f9ff; padding: 12px 16px; border-radius: 8px 8px 0 0; border: 1px solid #bae6fd;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>Inline Editing with Validation</strong>
            <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
              {{ isEditing ? 'Editing mode - make changes and save' : 'View mode - click Edit to start' }}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <template v-if="!isEditing">
              <VcButton @click="startEditing" variant="primary" small>
                Edit
              </VcButton>
            </template>
            <template v-else>
              <VcButton @click="cancelEditing" small>
                Cancel
              </VcButton>
              <VcButton @click="saveChanges" variant="primary" small :disabled="!editingIsValid || !editingIsDirty">
                Save
              </VcButton>
            </template>
          </div>
        </div>
      </div>

      <!-- Status bar -->
      <div v-if="isEditing" style="background: #fef3c7; padding: 8px 16px; font-size: 12px; color: #92400e; border-left: 1px solid #fcd34d; border-right: 1px solid #fcd34d;">
        <strong>Editing:</strong>
        isDirty: {{ editingIsDirty }} |
        isValid: {{ editingIsValid }} |
        Changes: {{ editingChangesCount }}
      </div>

      <!-- Action Log -->
      <div v-if="actionLog.length" style="background: #f1f5f9; padding: 8px 16px; font-size: 12px; color: #475569; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
        <strong>Log:</strong> {{ actionLog.join(' → ') }}
      </div>

      <div style="height: 250px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden;">
        <VcDataTable
          ref="tableRef"
          :items="items"
          @edit-save="handleEditSave"
          @edit-cancel="handleEditCancel"
        >
          <!-- VeeValidate rules: required, min (length), min_value (number), integer -->
          <VcColumn id="name" field="name" title="Product Name" editable :rules="{ required: true, min: 3 }" />
          <VcColumn id="price" field="price" title="Price" type="money" editable :rules="{ required: true, min_value: 0.01 }" />
          <VcColumn id="stock" field="stock" title="Stock" type="number" editable :rules="{ required: true, min_value: 0, integer: true }" />
        </VcDataTable>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;">
        <strong>VeeValidate Rules (on VcColumn):</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li><strong>Name:</strong> <code>:rules="{ required: true, min: 3 }"</code></li>
          <li><strong>Price:</strong> <code>:rules="{ required: true, min_value: 0.01 }"</code></li>
          <li><strong>Stock:</strong> <code>:rules="{ required: true, min_value: 0, integer: true }"</code></li>
        </ul>
        <strong style="display: block; margin-top: 12px;">API Usage:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li><code>tableRef.startEditing()</code> - Enter edit mode</li>
          <li><code>tableRef.saveChanges()</code> - Validate and save</li>
          <li><code>tableRef.cancelEditing()</code> - Discard changes</li>
          <li><code>tableRef.isValid</code> - Computed validation state (VeeValidate)</li>
          <li><code>tableRef.isDirty</code> - Computed dirty state (based on changes)</li>
        </ul>
      </div>
    </div>
  `,
});
InlineEditingWithValidation.parameters = {
  docs: {
    description: {
      story:
        "Inline editing with VeeValidate validation rules. Uses startEditing()/saveChanges()/cancelEditing() lifecycle. Validation rules are VeeValidate rules passed via :rules prop on VcColumn (e.g., { required: true, min: 3 }).",
    },
  },
};

/**
 * Custom add row button via header slot
 */
export const CustomAddRowButton: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcButton },
  setup() {
    const tableRef = ref<any>(null);

    const items = ref([
      { id: 1, name: "Product A", category: "Electronics", price: 99.99 },
      { id: 2, name: "Product B", category: "Clothing", price: 49.99 },
    ]);

    let nextId = 3;

    const addElectronics = () => {
      tableRef.value?.addRow({
        id: nextId++,
        name: `Electronics ${nextId - 1}`,
        category: "Electronics",
        price: 199.99,
      });
    };

    const addClothing = () => {
      tableRef.value?.addRow({
        id: nextId++,
        name: `Clothing ${nextId - 1}`,
        category: "Clothing",
        price: 29.99,
      });
    };

    return {
      tableRef,
      items,
      addElectronics,
      addClothing,
    };
  },
  template: `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: #f0f9ff; padding: 12px 16px; border-radius: 8px 8px 0 0; border: 1px solid #bae6fd;">
        <strong>Custom Add Row Buttons</strong>
        <div style="font-size: 12px; color: #0369a1; margin-top: 4px;">
          Add different product types with pre-filled data
        </div>
      </div>

      <div style="height: 250px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden;">
        <VcDataTable
          ref="tableRef"
          :items="items"
        >
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; background: #fafafa;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Products</h3>
              <div style="display: flex; gap: 8px;">
                <VcButton @click="addElectronics" small>
                  + Electronics
                </VcButton>
                <VcButton @click="addClothing" small>
                  + Clothing
                </VcButton>
              </div>
            </div>
          </template>

          <VcColumn id="name" field="name" title="Product Name" />
          <VcColumn id="category" field="category" title="Category" />
          <VcColumn id="price" field="price" title="Price" type="money" />
        </VcDataTable>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;">
        <strong>Pattern:</strong> Use <code>#header</code> slot for custom add buttons.
        Each button calls <code>tableRef.addRow()</code> with different defaults.
        Set <code>:add-row="{ enabled: false }"</code> to hide the built-in button.
      </div>
    </div>
  `,
});
CustomAddRowButton.parameters = {
  docs: {
    description: {
      story:
        "Custom add row buttons in the header slot. Call tableRef.addRow() with different default values to create different types of rows.",
    },
  },
};

// =============================================================================
// DECLARATIVE COLUMN FILTERS
// =============================================================================

/**
 * Declarative Column Filters
 *
 * Use the `filter` prop on VcColumn to configure filters declaratively:
 * - `filter: true` — text filter (field = column.id)
 * - `filter: "keyword"` — text filter with custom backend field
 * - `filter: { options: [...] }` — single select filter
 * - `filter: { options: [...], multiple: true }` — multi-select filter
 * - `filter: { range: ["startDate", "endDate"] }` — date range filter
 *
 * The `@filter` event emits a flat object ready for backend API.
 */
export const DeclarativeFilters: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);

    // Status options for select filter
    const statusOptions = [
      { value: "In Stock", label: "In Stock" },
      { value: "Out of Stock", label: "Out of Stock" },
      { value: "Low Stock", label: "Low Stock" },
    ];

    // Currency options for multi-select filter
    const currencyOptions = [
      { value: "USD", label: "US Dollar" },
      { value: "EUR", label: "Euro" },
      { value: "GBP", label: "British Pound" },
    ];

    // Event log
    const filterLog = ref<string[]>([]);
    const activeFilters = ref<Record<string, unknown>>({});

    const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
      const filters = event.filters;
      activeFilters.value = filters;
      const entries = Object.entries(filters);
      const parts: string[] = [];
      for (const [k, v] of entries) {
        parts.push(k + "=" + JSON.stringify(v));
      }
      filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
      if (filterLog.value.length > 5) filterLog.value.pop();

      // Client-side filtering demo (in real app, you'd send to backend)
      if (Object.keys(filters).length === 0) {
        products.value = [...mockProducts];
      } else {
        products.value = mockProducts.filter((p) => {
          // Name text filter
          if (filters.name && !p.name.toLowerCase().includes(String(filters.name).toLowerCase())) {
            return false;
          }
          // Status select filter
          if (filters.status && p.status !== filters.status) {
            return false;
          }
          // Currency multi-select filter
          if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
            if (!filters.currency.includes(p.currency)) {
              return false;
            }
          }
          // Date range filter
          if (filters.startDate || filters.endDate) {
            const created = p.createdAt.getTime();
            if (filters.startDate && created < new Date(filters.startDate as string).getTime()) {
              return false;
            }
            if (filters.endDate && created > new Date(filters.endDate as string).getTime()) {
              return false;
            }
          }
          return true;
        });
      }
    };

    return { products, statusOptions, currencyOptions, filterLog, activeFilters, handleFilter };
  },
  template: `
    <div style="height: 600px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-primary-50 tw-to-primary-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Declarative Column Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Configure filters directly on columns using the <code class="tw-bg-additional-50 tw-px-1 tw-rounded">filter</code> prop.
          Click the filter icon (funnel) in column headers.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Filter Types:</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li><strong>Name:</strong> Text filter (<code>filter: true</code>)</li>
              <li><strong>Status:</strong> Single select (<code>filter: { options }</code>)</li>
              <li><strong>Currency:</strong> Multi-select (<code>filter: { options, multiple: true }</code>)</li>
              <li><strong>Created:</strong> Date range (<code>filter: { range: [...] }</code>)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-24">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet</div>
      </div>

      <VcDataTable
        :items="products"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
          filter-placeholder="Search by name..."
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
        />
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
          :filter="{ options: statusOptions }"
          filter-placeholder="Select status"
        />
        <VcColumn
          id="currency"
          field="currency"
          title="Currency"
          :filter="{ options: currencyOptions, multiple: true }"
          filter-placeholder="Select currencies"
        />
        <VcColumn
          id="createdAt"
          field="createdAt"
          title="Created Date"
          type="date"
          :filter="{ range: ['startDate', 'endDate'] }"
        />
      </VcDataTable>
    </div>
  `,
});
DeclarativeFilters.parameters = {
  docs: {
    description: {
      story:
        "Declarative filter configuration using the filter prop. Supports text, single/multi select, and date range filters. The @filter event emits a flat object ready for backend API calls.",
    },
  },
};

/**
 * Custom Filter Template
 *
 * Use the #filter slot for complete control over the filter UI.
 * The slot provides:
 * - value / updateValue — current value and setter
 * - startDate / updateStartDate — for date range
 * - endDate / updateEndDate — for date range
 * - applyFilter — apply and close
 * - clearFilter — clear and close
 *
 * Note: Clear/Apply buttons are provided by ColumnFilter overlay automatically.
 */
export const CustomFilterTemplate: StoryFn = () => ({
  components: { VcDataTable, VcColumn, VcInput },
  setup() {
    const allProducts = [...mockProducts];
    const products = ref([...allProducts]);
    const filterLog = ref<string[]>([]);

    const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
      const filters = event.filters;

      // Log
      const entries = Object.entries(filters);
      const parts: string[] = [];
      for (const [k, v] of entries) {
        parts.push(k + "=" + JSON.stringify(v));
      }
      filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
      if (filterLog.value.length > 5) filterLog.value.pop();

      // Apply client-side filtering for demo
      let filtered = [...allProducts];

      // Text filter on name
      if (filters.name && typeof filters.name === "string") {
        const search = filters.name.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
      }

      // Price range filter
      if (filters.price && typeof filters.price === "object") {
        const range = filters.price as { min?: number; max?: number };
        if (range.min != null) {
          filtered = filtered.filter((p) => p.price >= Number(range.min));
        }
        if (range.max != null) {
          filtered = filtered.filter((p) => p.price <= Number(range.max));
        }
      }

      products.value = filtered;
    };

    return { products, filterLog, handleFilter };
  },
  template: `
    <div style="height: 500px">
      <div class="tw-mb-4 tw-p-3 tw-bg-info-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold">Custom Filter Templates</p>
        <p class="tw-text-neutrals-600">
          Use the <code>#filter</code> slot for complete control over the filter UI.
          This example shows a custom price range filter with min/max inputs.
        </p>
        <p class="tw-text-neutrals-500 tw-text-xs tw-mt-1">
          Note: Clear/Apply buttons are provided automatically by the filter overlay.
        </p>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet</div>
      </div>

      <VcDataTable
        :items="products"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
          :filter="true"
        >
          <template #filter="{ value, updateValue }">
            <div class="tw-space-y-2">
              <p class="tw-text-xs tw-font-medium tw-text-neutrals-600">Price Range</p>
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcInput
                  type="number"
                  placeholder="Min"
                  size="small"
                  :model-value="value?.min"
                  @update:model-value="(v) => updateValue({ ...value, min: v })"
                />
                <span class="tw-text-neutrals-400 tw-text-sm">—</span>
                <VcInput
                  type="number"
                  placeholder="Max"
                  size="small"
                  :model-value="value?.max"
                  @update:model-value="(v) => updateValue({ ...value, max: v })"
                />
              </div>
            </div>
          </template>
        </VcColumn>
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
        />
      </VcDataTable>
    </div>
  `,
});
CustomFilterTemplate.parameters = {
  docs: {
    description: {
      story:
        "Custom filter templates using the #filter slot. The slot provides updateValue for setting filter value. Clear/Apply buttons are provided automatically by the overlay.",
    },
  },
};

/**
 * Global Filters
 *
 * Use the `globalFilters` prop to render a "Filters" button above the table.
 * Clicking the button opens a panel with the configured filters.
 * The `@filter` event emits a flat payload that merges both column and global filter values.
 */
export const GlobalFilters: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);

    const statusOptions = [
      { value: "In Stock", label: "In Stock" },
      { value: "Out of Stock", label: "Out of Stock" },
      { value: "Low Stock", label: "Low Stock" },
    ];

    const currencyOptions = [
      { value: "USD", label: "US Dollar" },
      { value: "EUR", label: "Euro" },
      { value: "GBP", label: "British Pound" },
    ];

    // Global filter definitions
    const globalFilters = [
      {
        id: "search",
        label: "Search by name",
        filter: true,
        placeholder: "Type product name...",
      },
      {
        id: "status",
        label: "Status",
        filter: { options: statusOptions },
        placeholder: "Select status",
      },
      {
        id: "currency",
        label: "Currency",
        filter: { options: currencyOptions, multiple: true },
        placeholder: "Select currencies",
      },
      {
        id: "created",
        label: "Created Date",
        filter: { range: ["createdFrom", "createdTo"] },
      },
    ];

    // Event log
    const filterLog = ref<string[]>([]);
    const activeFilters = ref<Record<string, unknown>>({});

    const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
      const filters = event.filters;
      activeFilters.value = filters;
      const entries = Object.entries(filters);
      const parts: string[] = [];
      for (const [k, v] of entries) {
        parts.push(k + "=" + JSON.stringify(v));
      }
      filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
      if (filterLog.value.length > 8) filterLog.value.pop();

      // Client-side filtering demo
      if (Object.keys(filters).length === 0) {
        products.value = [...mockProducts];
      } else {
        products.value = mockProducts.filter((p) => {
          if (filters.search && !p.name.toLowerCase().includes(String(filters.search).toLowerCase())) {
            return false;
          }
          if (filters.status && p.status !== filters.status) {
            return false;
          }
          if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
            if (!filters.currency.includes(p.currency)) {
              return false;
            }
          }
          if (filters.createdFrom || filters.createdTo) {
            const created = p.createdAt.getTime();
            if (filters.createdFrom && created < new Date(filters.createdFrom as string).getTime()) {
              return false;
            }
            if (filters.createdTo && created > new Date(filters.createdTo as string).getTime()) {
              return false;
            }
          }
          return true;
        });
      }
    };

    return { products, globalFilters, filterLog, activeFilters, handleFilter };
  },
  template: `
    <div style="height: 650px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-accent-50 tw-to-info-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Global Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">globalFilters</code> prop renders a
          "Filters" button above the table. Click it to open a panel with text, select, multi-select
          and date-range filters. The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@filter</code> event
          emits a single flat payload merging both column and global filter values.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Configured Global Filters:</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li><strong>Search:</strong> Text filter</li>
              <li><strong>Status:</strong> Single select</li>
              <li><strong>Currency:</strong> Multi-select</li>
              <li><strong>Created Date:</strong> Date range (createdFrom / createdTo)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-24">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">No filters applied yet — click the "Filters" button above the table</div>
      </div>

      <VcDataTable
        :items="products"
        :global-filters="globalFilters"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
        />
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
        />
        <VcColumn
          id="currency"
          field="currency"
          title="Currency"
        />
        <VcColumn
          id="createdAt"
          field="createdAt"
          title="Created Date"
          type="date"
        />
      </VcDataTable>
    </div>
  `,
});
GlobalFilters.parameters = {
  docs: {
    description: {
      story:
        "Global filters rendered via the `globalFilters` prop. A 'Filters' button appears above the table. " +
        "The panel supports text, single/multi select, and date range filters. " +
        "The @filter event emits a flat object combining both column and global filter values.",
    },
  },
};

/**
 * Global Filters + Column Filters Combined
 *
 * Both `globalFilters` prop and column-level `filter` props work together.
 * The `@filter` event merges payloads from both into a single flat object.
 */
export const GlobalAndColumnFiltersCombined: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);

    const statusOptions = [
      { value: "In Stock", label: "In Stock" },
      { value: "Out of Stock", label: "Out of Stock" },
      { value: "Low Stock", label: "Low Stock" },
    ];

    const currencyOptions = [
      { value: "USD", label: "US Dollar" },
      { value: "EUR", label: "Euro" },
    ];

    // Global filters — search + date range
    const globalFilters = [
      {
        id: "search",
        label: "Quick Search",
        filter: true,
        placeholder: "Search products...",
      },
      {
        id: "created",
        label: "Created Date",
        filter: { range: ["createdFrom", "createdTo"] },
      },
    ];

    const filterLog = ref<string[]>([]);
    const activeFilters = ref<Record<string, unknown>>({});

    const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
      const filters = event.filters;
      activeFilters.value = filters;
      const entries = Object.entries(filters);
      const parts: string[] = [];
      for (const [k, v] of entries) {
        parts.push(k + "=" + JSON.stringify(v));
      }
      filterLog.value.unshift("Filter: { " + (parts.join(", ") || "empty") + " }");
      if (filterLog.value.length > 8) filterLog.value.pop();

      // Client-side filtering demo
      if (Object.keys(filters).length === 0) {
        products.value = [...mockProducts];
      } else {
        products.value = mockProducts.filter((p) => {
          if (filters.search && !p.name.toLowerCase().includes(String(filters.search).toLowerCase())) {
            return false;
          }
          if (filters.name && !p.name.toLowerCase().includes(String(filters.name).toLowerCase())) {
            return false;
          }
          if (filters.status && p.status !== filters.status) {
            return false;
          }
          if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
            if (!filters.currency.includes(p.currency)) {
              return false;
            }
          }
          if (filters.createdFrom || filters.createdTo) {
            const created = p.createdAt.getTime();
            if (filters.createdFrom && created < new Date(filters.createdFrom as string).getTime()) {
              return false;
            }
            if (filters.createdTo && created > new Date(filters.createdTo as string).getTime()) {
              return false;
            }
          }
          return true;
        });
      }
    };

    return { products, statusOptions, currencyOptions, globalFilters, filterLog, activeFilters, handleFilter };
  },
  template: `
    <div style="height: 650px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-warning-50 tw-to-warning-100 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Global + Column Filters Combined</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Both <code class="tw-bg-additional-50 tw-px-1 tw-rounded">globalFilters</code> (button above table) and
          column-level <code class="tw-bg-additional-50 tw-px-1 tw-rounded">filter</code> props (icons in headers)
          work together. The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@filter</code> event merges
          both payloads into a single flat object for the backend.
        </p>

        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Global Filters (button panel):</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li>Quick Search (text)</li>
              <li>Created Date (date range)</li>
            </ul>
            <p class="tw-font-medium tw-mt-2 tw-mb-1">Column Filters (header icons):</p>
            <ul class="tw-list-disc tw-list-inside tw-text-neutrals-600">
              <li>Name (text)</li>
              <li>Status (select)</li>
              <li>Currency (multi-select)</li>
            </ul>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Merged Payload:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-28">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-12 tw-overflow-hidden">
        <div v-for="(log, i) in filterLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!filterLog.length" class="tw-text-neutrals-400">Try both: click column filter icons and the "Filters" button</div>
      </div>

      <VcDataTable
        :items="products"
        :global-filters="globalFilters"
        @filter="handleFilter"
      >
        <VcColumn
          id="name"
          field="name"
          title="Product Name"
          :filter="true"
          filter-placeholder="Filter by name..."
        />
        <VcColumn
          id="price"
          field="price"
          title="Price"
          type="money"
        />
        <VcColumn
          id="stock"
          field="stock"
          title="Stock"
          type="number"
        />
        <VcColumn
          id="status"
          field="status"
          title="Status"
          :filter="{ options: statusOptions }"
          filter-placeholder="Select status"
        />
        <VcColumn
          id="currency"
          field="currency"
          title="Currency"
          :filter="{ options: currencyOptions, multiple: true }"
          filter-placeholder="Select currencies"
        />
        <VcColumn
          id="createdAt"
          field="createdAt"
          title="Created Date"
          type="date"
        />
      </VcDataTable>
    </div>
  `,
});
GlobalAndColumnFiltersCombined.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates combining global filters (via `globalFilters` prop) with per-column filters (via `filter` prop on VcColumn). " +
        "Both filter types merge their values into a single flat @filter payload.",
    },
  },
};

/**
 * Inline Search Bar
 *
 * Use the `searchable` prop to show a built-in search bar above the table.
 * The `@search` event is debounced (default 300ms) — use it for backend filtering.
 * Use `v-model:search-value` for two-way binding of the input value.
 */
export const SearchBar: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const searchValue = ref("");
    const searchLog = ref<string[]>([]);

    const handleSearch = (value: string) => {
      searchLog.value.unshift(`search: "${value}" (${new Date().toLocaleTimeString()})`);
      if (searchLog.value.length > 6) searchLog.value.pop();

      // Client-side filtering demo
      if (!value) {
        products.value = [...mockProducts];
      } else {
        const q = value.toLowerCase();
        products.value = mockProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q) ||
            p.currency.toLowerCase().includes(q),
        );
      }
    };

    return { products, searchValue, searchLog, handleSearch };
  },
  template: `
    <div style="height: 550px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-primary-50 tw-to-info-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Inline Search Bar</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          Add <code class="tw-bg-additional-50 tw-px-1 tw-rounded">searchable</code> to show a search bar above the table.
          The <code class="tw-bg-additional-50 tw-px-1 tw-rounded">@search</code> event is debounced (300ms by default).
          Use <code class="tw-bg-additional-50 tw-px-1 tw-rounded">v-model:search-value</code> for two-way binding.
        </p>
        <p class="tw-text-sm"><strong>Current value:</strong> "{{ searchValue }}"</p>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in searchLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!searchLog.length" class="tw-text-neutrals-400">Type in the search bar to see debounced events here</div>
      </div>

      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Search products by name, status, or currency..."
        :search-debounce="300"
        @search="handleSearch"
      >
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="currency" field="currency" title="Currency" />
      </VcDataTable>
    </div>
  `,
});
SearchBar.parameters = {
  docs: {
    description: {
      story:
        "Built-in search bar rendered via the `searchable` prop. " +
        "The `@search` event emits the search value after a configurable debounce delay (default 300ms). " +
        "Use `v-model:search-value` for two-way binding and `search-placeholder` for custom placeholder text.",
    },
  },
};

/**
 * Search Bar + Global Filters Combined
 *
 * When both `searchable` and `globalFilters` are provided, the search bar and the
 * global filters button appear together in a single header row.
 * The `@search` event handles the search input, while `@filter` handles the global filters.
 */
export const SearchWithGlobalFilters: StoryFn = () => ({
  components: { VcDataTable, VcColumn },
  setup() {
    const products = ref([...mockProducts]);
    const searchValue = ref("");
    const eventLog = ref<string[]>([]);
    const activeFilters = ref<Record<string, unknown>>({});

    const statusOptions = [
      { value: "In Stock", label: "In Stock" },
      { value: "Out of Stock", label: "Out of Stock" },
      { value: "Low Stock", label: "Low Stock" },
    ];

    const currencyOptions = [
      { value: "USD", label: "US Dollar" },
      { value: "EUR", label: "Euro" },
    ];

    const globalFilters = [
      {
        id: "status",
        label: "Status",
        filter: { options: statusOptions },
        placeholder: "Select status",
      },
      {
        id: "currency",
        label: "Currency",
        filter: { options: currencyOptions, multiple: true },
        placeholder: "Select currencies",
      },
    ];

    const applyFiltering = () => {
      let result = [...mockProducts];
      const q = searchValue.value.toLowerCase();
      if (q) {
        result = result.filter((p) => p.name.toLowerCase().includes(q));
      }
      const filters = activeFilters.value;
      if (filters.status) {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters.currency && Array.isArray(filters.currency) && filters.currency.length > 0) {
        result = result.filter((p) => (filters.currency as string[]).includes(p.currency));
      }
      products.value = result;
    };

    const handleSearch = (value: string) => {
      eventLog.value.unshift(`@search: "${value}"`);
      if (eventLog.value.length > 6) eventLog.value.pop();
      applyFiltering();
    };

    const handleFilter = (event: { filters: Record<string, unknown>; filteredValue: unknown[] }) => {
      activeFilters.value = event.filters;
      const parts = Object.entries(event.filters).map(([k, v]) => k + "=" + JSON.stringify(v));
      eventLog.value.unshift(`@filter: { ${parts.join(", ") || "empty"} }`);
      if (eventLog.value.length > 6) eventLog.value.pop();
      applyFiltering();
    };

    return { products, searchValue, globalFilters, eventLog, activeFilters, handleSearch, handleFilter };
  },
  template: `
    <div style="height: 600px" class="tw-overflow-hidden">
      <div class="tw-mb-4 tw-p-4 tw-bg-gradient-to-r tw-from-accent-50 tw-to-primary-50 tw-rounded-lg">
        <p class="tw-font-semibold tw-text-lg tw-mb-2">Search + Global Filters</p>
        <p class="tw-text-neutrals-600 tw-text-sm tw-mb-3">
          When both <code class="tw-bg-additional-50 tw-px-1 tw-rounded">searchable</code> and
          <code class="tw-bg-additional-50 tw-px-1 tw-rounded">global-filters</code> are provided,
          the search bar and the "Filters" button appear together in a single header row.
        </p>
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div>
            <p class="tw-font-medium tw-mb-1">Search:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs">"{{ searchValue }}"</pre>
          </div>
          <div class="tw-min-w-0">
            <p class="tw-font-medium tw-mb-1">Active Filters:</p>
            <pre class="tw-bg-additional-50 tw-p-2 tw-rounded tw-text-xs tw-overflow-auto tw-h-12">{{ JSON.stringify(activeFilters, null, 2) || '{}' }}</pre>
          </div>
        </div>
      </div>

      <div class="tw-mb-3 tw-p-2 tw-bg-neutrals-100 tw-rounded tw-text-xs tw-font-mono tw-h-16 tw-overflow-hidden">
        <div v-for="(log, i) in eventLog" :key="i" class="tw-text-neutrals-600 tw-truncate">{{ log }}</div>
        <div v-if="!eventLog.length" class="tw-text-neutrals-400">Type in the search bar or use global filters to see events here</div>
      </div>

      <VcDataTable
        :items="products"
        searchable
        v-model:search-value="searchValue"
        search-placeholder="Search by product name..."
        :global-filters="globalFilters"
        @search="handleSearch"
        @filter="handleFilter"
      >
        <VcColumn id="name" field="name" title="Product Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />
        <VcColumn id="currency" field="currency" title="Currency" />
      </VcDataTable>
    </div>
  `,
});
SearchWithGlobalFilters.parameters = {
  docs: {
    description: {
      story:
        "Demonstrates the search bar and global filters combined in a single header row. " +
        "The search bar emits `@search` (debounced), while global filters emit `@filter`. " +
        "Both can be used together for comprehensive backend-driven filtering.",
    },
  },
};
