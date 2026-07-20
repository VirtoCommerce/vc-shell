import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { Product, mockProducts, OrderProduct, mockProductsWithOrders } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExpandableRows: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with expandable rows and selection
 *
 * Demonstrates expandable rows working alongside selection checkboxes.
 */

export const ExpandableRowsWithSelection: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with custom expansion icons
 *
 * Customize the expand/collapse icons using the expandedRowIcon and collapsedRowIcon props.
 */

export const ExpandableRowsCustomIcons: Story = {
  render: () => ({
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
        expanded-row-icon="lucide-minus"
        collapsed-row-icon="lucide-plus"
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
  }),
};

/**
 * VcDataTable with conditional row expansion
 *
 * Use the isRowExpandable prop to control which rows can be expanded.
 * Rows that fail the predicate show no expand toggle and cannot be expanded programmatically.
 */

export const ConditionalExpandableRows: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const expandedRows = ref<OrderProduct[]>([]);

      // Only products that have orders can be expanded
      const isRowExpandable = (item: OrderProduct) => !!(item.orders && item.orders.length > 0);

      return {
        products: mockProductsWithOrders,
        expandedRows,
        isRowExpandable,
      };
    },
    template: `
    <div style="height: 600px">
      <div class="tw-mb-4 tw-p-3 tw-bg-warning-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Conditional Expandable Rows</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Only rows with orders show the expand toggle. Rows without orders cannot be expanded.</p>
        <p><strong>Expanded:</strong> {{ expandedRows.map(p => p.name).join(', ') || 'None' }}</p>
      </div>
      <VcDataTable
        :items="products"
        v-model:expanded-rows="expandedRows"
        :is-row-expandable="isRowExpandable"
      >
        <VcColumn id="expander" :expander="true" />
        <VcColumn id="name" field="name" title="Name" />
        <VcColumn id="price" field="price" title="Price" type="money" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" />
        <VcColumn id="status" field="status" title="Status" />

        <template #expansion="{ data }">
          <div class="tw-p-4">
            <h4 class="tw-font-semibold tw-mb-3 tw-text-neutrals-700">Order History for {{ data.name }}</h4>
            <table class="tw-w-full tw-text-sm tw-border tw-border-neutrals-200">
              <thead class="tw-bg-neutrals-100">
                <tr>
                  <th class="tw-p-2 tw-text-left">Order ID</th>
                  <th class="tw-p-2 tw-text-left">Date</th>
                  <th class="tw-p-2 tw-text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in data.orders" :key="order.orderId" class="tw-border-t tw-border-neutrals-200">
                  <td class="tw-p-2">{{ order.orderId }}</td>
                  <td class="tw-p-2">{{ order.date }}</td>
                  <td class="tw-p-2 tw-text-right">{{ order.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </VcDataTable>
    </div>
    `,
  }),
};

// ============================================================================
// Column Resize Stories
// ============================================================================

/**
 * Column resize with default settings
 *
 * Drag the border between column headers to resize columns.
 * Uses two-column resize mode: dragging one column affects its neighbor.
 */

export const ColumnResize: Story = {
  render: () => ({
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
  }),
};

/**
 * Column resize with minimum width constraints
 *
 * Columns cannot be resized below 60px (default minimum).
 */

export const ColumnResizeWithMinWidth: Story = {
  render: () => ({
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
  }),
};

// ============================================================================
// Column Reorder Stories
// ============================================================================

/**
 * Column reorder via drag and drop
 *
 * Drag column headers to reorder them. Uses 50% threshold for smooth swapping.
 */

export const ColumnReorder: Story = {
  render: () => ({
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
  }),
};

/**
 * Column reorder with selection column
 *
 * Selection column stays fixed - it cannot be reordered.
 */

export const ColumnReorderWithSelection: Story = {
  render: () => ({
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
  }),
};

/**
 * Both column resize and reorder enabled
 */

export const ColumnResizeAndReorder: Story = {
  render: () => ({
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
  }),
};

// ============================================================================
// State Persistence Stories
// ============================================================================

/**
 * State persistence with localStorage
 *
 * Column widths and order are saved to localStorage and restored on page reload.
 */
