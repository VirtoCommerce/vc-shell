import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, computed } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { useDataTableSort } from "@ui/composables/useDataTableSort";
import { withMobileView } from "../../../../../.storybook/decorators";
import { Product, mockProducts } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiSort: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with removable sort (triple-click cycle)
 *
 * Click a column to cycle through: ascending -> descending -> no sort.
 * State is bound via `v-model:sort-field` / `v-model:sort-order` using the
 * `useDataTableSort` composable; when the order returns to `0` the original
 * row order is restored.
 */

export const RemovableSort: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const { sortField, sortOrder, sortExpression } = useDataTableSort();

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
    <div style="height: 450px">
      <div class="tw-mb-4 tw-p-3 tw-bg-success-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">Removable Sort</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Click a column header to cycle: <strong>ASC</strong> -> <strong>DESC</strong> -> <strong>None</strong></p>
        <p><strong>Current sort:</strong> {{ sortExpression ?? 'None' }}</p>
      </div>
      <VcDataTable
        :items="products"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        :removable-sort="true"
      >
        <VcColumn id="name" field="name" title="Name" sortable />
        <VcColumn id="price" field="price" title="Price" type="money" sortable />
        <VcColumn id="stock" field="stock" title="Stock" type="number" sortable />
        <VcColumn id="status" field="status" title="Status" sortable />
      </VcDataTable>
    </div>
  `,
  }),
};

/**
 * VcDataTable with multi-sort and removable sort combined
 *
 * Ctrl+click to add columns to sort, and clicking a sorted column cycles through ASC -> DESC -> removed.
 */

export const MultiSortRemovable: Story = {
  render: () => ({
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
  }),
};

// ============================================================================
// Row Reorder Stories
// ============================================================================

/**
 * VcDataTable with row reorder via VcColumn
 *
 * Add a VcColumn with rowReorder prop to enable drag-and-drop row reordering.
 * A drag handle icon appears in the column, allowing users to drag rows to reorder.
 */

export const RowReorder: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with row reorder via the `reorderableRows` prop alone.
 *
 * Setting `reorderableRows` to `true` is enough to enable drag-and-drop — a grip
 * handle appears automatically on the left of each row and is the only drag affordance
 * (handle-only drag keeps row clicks and selection working). No dedicated `:row-reorder`
 * VcColumn is required; that column is optional and only reserves an aligned slot.
 */

export const RowReorderViaProp: Story = {
  render: () => ({
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
        <p class="tw-font-semibold tw-mb-1">Row Reorder (via reorderableRows prop)</p>
        <p class="tw-text-neutrals-600 tw-mb-2">Enabling <code>reorderableRows</code> shows a drag handle automatically — grab the handle on the left to reorder. No dedicated <code>:row-reorder</code> VcColumn needed.</p>
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
  }),
};

/**
 * VcDataTable with row reorder and selection combined
 *
 * Demonstrates row reorder working alongside selection checkboxes.
 */

export const RowReorderWithSelection: Story = {
  render: () => ({
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
  }),
};

/**
 * Row reorder in the mobile card view.
 *
 * On mobile, `reorderableRows` renders a grip handle on the left of each card.
 * Drag the handle (touch or mouse) to reorder — card swipe actions and long-press
 * selection keep working because dragging is handle-only. Uses the `withMobileView`
 * decorator to activate the mobile layout.
 *
 * **Note:** View this story on a mobile viewport (375px) to see the card layout.
 */

export const MobileRowReorder: Story = {
  render: () => ({
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
    <div style="height: 600px; max-width: 375px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong>Mobile Row Reorder</strong>
        <span style="color: #64748b; font-size: 12px;"> (drag the left handle)</span>
        <ul style="margin: 6px 0 0; padding-left: 16px; font-size: 11px; color: #64748b;">
          <li v-for="(event, i) in eventLog" :key="i">{{ event }}</li>
          <li v-if="!eventLog.length" style="list-style: none; margin-left: -16px;">No reorder events yet</li>
        </ul>
      </div>
      <VcDataTable
        :items="products"
        :reorderable-rows="true"
        @row-reorder="handleRowReorder"
      >
        <VcColumn id="name" field="name" title="Name" mobile-role="title" />
        <VcColumn id="price" field="price" title="Price" type="money" mobile-role="field" />
        <VcColumn id="stock" field="stock" title="Stock" type="number" mobile-role="field" />
        <VcColumn id="status" field="status" title="Status" type="status" mobile-role="status" />
      </VcDataTable>
    </div>
  `,
  }),
};
MobileRowReorder.decorators = [withMobileView];
MobileRowReorder.parameters = {
  viewport: { defaultViewport: "mobile1" },
  docs: {
    description: {
      story:
        "Row reorder on the mobile card view. Enabling `reorderableRows` shows a left grip handle on each card; drag it to reorder. Handle-only drag preserves swipe actions and long-press selection.",
    },
  },
};

// ============================================================================
// Expandable Rows Stories
// ============================================================================

// Extended product interface with order details for expansion demo
