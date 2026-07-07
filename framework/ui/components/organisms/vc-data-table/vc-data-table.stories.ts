import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, computed } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcInput } from "@ui/components/molecules";
import { useDataTablePagination } from "@ui/composables/useDataTablePagination";
import { useDataTableSort } from "@ui/composables/useDataTableSort";
import { Product, mockProducts } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A compositional data table with declarative column definitions via VcColumn slots. " +
          "Supports sorting, filtering, inline cell editing, row selection, drag-and-drop row reorder, " +
          "column resize and reorder, virtual scrolling, mobile card view, and state persistence.",
      },
      // This component has 90+ stories. Inline rendering would mount every
      // VcDataTable instance at once on the Docs page and hang the browser.
      // Render each story in a lazy iframe instead (mounts only when scrolled
      // into view). iframeHeight keeps the table visible without inner scroll.
      story: { inline: false, iframeHeight: 500 },
    },
  },
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with sorting driven by the `useDataTableSort` composable.
 *
 * State is bound via `v-model:sort-field` / `v-model:sort-order`; the table's
 * default `removableSort` cycle (ASC → DESC → none) flows the numeric order
 * (1 / -1 / 0) back into the composable refs. The displayed list is a `computed`
 * derived from that state — when the order is `0` the original order is restored.
 */

export const WithSorting: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const { sortField, sortOrder, sortExpression } = useDataTableSort({
        initialField: "name",
        initialDirection: "ASC",
      });

      const products = computed(() => {
        if (!sortField.value || sortOrder.value === 0) {
          return [...mockProducts];
        }
        const field = sortField.value as keyof Product;
        const order = sortOrder.value;
        return [...mockProducts].sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (typeof aVal === "string" && typeof bVal === "string") {
            return order * aVal.localeCompare(bVal);
          }
          return order * (Number(aVal) - Number(bVal));
        });
      });

      return { products, sortField, sortOrder, sortExpression };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Sort: {{ sortExpression ?? 'none' }}</p>
      <VcDataTable
        :items="products"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * VcDataTable with selection
 */

export const WithSelection: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with selection and disabled rows
 */

export const WithSelectableRows: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with all cell types
 */

export const WithCellTypes: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with custom cell content via slots
 */

export const WithCustomCells: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with built-in pagination via `pagination` prop
 */

export const WithPagination: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with pagination managed by `useDataTablePagination` composable.
 * Returns a `reactive()` object passable directly as `:pagination` prop.
 * Eliminates manual Math.ceil/Math.floor boilerplate via `onPageChange` callback.
 */

export const WithPaginationComposable: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const allProducts = mockProducts;
      const pageSize = 3;

      // Simulate a search result with totalCount
      const searchResult = ref({ results: allProducts.slice(0, pageSize), totalCount: allProducts.length });

      const pagination = useDataTablePagination({
        pageSize,
        totalCount: computed(() => searchResult.value.totalCount),
        onPageChange: ({ skip }) => {
          // Simulate server-side pagination
          searchResult.value = {
            ...searchResult.value,
            results: allProducts.slice(skip, skip + pageSize),
          };
        },
      });

      return { products: computed(() => searchResult.value.results), pagination };
    },
    template: `
    <div style="height: 400px">
      <VcDataTable
        :items="products"
        :pagination="pagination"
        @pagination-click="pagination.goToPage"
      >
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * VcDataTable with striped variant
 */

export const Striped: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with bordered variant
 */

export const Bordered: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with loading state
 */

export const Loading: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with empty state
 */

export const Empty: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with header slot
 */

export const WithHeader: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with selection column via VcColumn
 *
 * This demonstrates defining a selection column via VcColumn with selectionMode prop.
 */
