import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcButton } from "@ui/components/atoms";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectAllWithPagination: Story = {
  render: () => ({
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
  }),
};
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

export const AddRemoveRows: Story = {
  render: () => ({
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
          icon: "lucide-trash-2",
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
          :add-row="{ enabled: true, position: 'footer', label: 'Add Product', icon: 'lucide-plus' }"
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
  }),
};
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
