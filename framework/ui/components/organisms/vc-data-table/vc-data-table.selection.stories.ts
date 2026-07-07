import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcInput } from "@ui/components/molecules";
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

export const SelectionViaVcColumn: Story = {
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
      >
        <VcColumn id="selection" selection-mode="multiple" />
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
 * VcDataTable with single selection (click row to select)
 *
 * In single selection mode, clicking a row selects it. No checkbox column is shown.
 */

export const SingleSelection: Story = {
  render: () => ({
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
  }),
};

export const ActiveItemHighlight: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const activeId = ref<string | undefined>(undefined);

      return { products: mockProducts, activeId };
    },
    template: `
    <div style="height: 400px">
      <p class="tw-mb-2">Active row ID: {{ activeId ?? 'None' }}
        <button class="tw-ml-2 tw-text-sm tw-underline" @click="activeId = undefined">Clear</button>
      </p>
      <VcDataTable
        :items="products"
        v-model:active-item-id="activeId"
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
ActiveItemHighlight.parameters = {
  docs: {
    description: {
      story:
        "Click a row to highlight it as active. Click again to deselect. Use `v-model:active-item-id` for two-way binding — the table automatically highlights the row matching the given ID and updates the value on row click.",
    },
  },
};

/**
 * VcDataTable with single selection via VcColumn (radio button style)
 */

export const SingleSelectionViaVcColumn: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with selection and isRowSelectable via VcColumn
 *
 * Demonstrates disabled checkboxes for rows that don't meet the criteria.
 */

export const SelectionWithDisabledRowsViaVcColumn: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with selection events
 *
 * Demonstrates row-select and row-unselect events.
 */

export const SelectionWithEvents: Story = {
  render: () => ({
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
  }),
};

// ============================================================================
// Editing Stories
// ============================================================================

/**
 * VcDataTable with cell editing
 *
 * Click on a cell to edit it. Press Enter or click outside to save.
 */

export const CellEditing: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with row editing
 *
 * Click the edit button to enable row editing. Click save/cancel to commit/revert.
 */

export const RowEditing: Story = {
  render: () => ({
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
  }),
};

/**
 * VcDataTable with row editing and custom editor buttons
 *
 * Shows how to combine row editing with selection.
 */

export const RowEditingWithSelection: Story = {
  render: () => ({
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
  }),
};

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
