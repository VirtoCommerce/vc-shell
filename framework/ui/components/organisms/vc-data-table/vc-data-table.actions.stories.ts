import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcButton } from "@ui/components/atoms";
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

export const StatePersistence: Story = {
  render: () => ({
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
  }),
};

/**
 * State persistence with sessionStorage
 *
 * State is saved to sessionStorage (cleared when browser tab is closed).
 */

export const StatePersistenceSession: Story = {
  render: () => ({
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
  }),
};

/**
 * Full featured example: all features combined
 *
 * Demonstrates resize, reorder, selection, sorting, and state persistence working together.
 */

export const FullFeaturedTable: Story = {
  render: () => ({
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
  }),
};

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

export const WithRowActions: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const eventLog = ref<string[]>([]);
      const maxQuickActions = ref(2);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-eye",
          title: "View",
          clickHandler: () => {
            eventLog.value.unshift(`View: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-pencil",
          title: "Edit",
          clickHandler: () => {
            eventLog.value.unshift(`Edit: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-copy",
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
          icon: "lucide-archive",
          title: "Archive",
          clickHandler: () => {
            eventLog.value.unshift(`Archived: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-trash-2",
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
          <select v-model.number="maxQuickActions" aria-label="Max quick actions" class="tw-border tw-rounded tw-px-2 tw-py-1">
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
  }),
};

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

export const WithRowActionsDropdown: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-eye",
          title: "View details",
          clickHandler: () => alert(`View: ${item.name}`),
        },
        {
          icon: "lucide-pencil",
          title: "Edit",
          clickHandler: () => alert(`Edit: ${item.name}`),
        },
        {
          icon: "lucide-copy",
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
          icon: "lucide-archive",
          title: "Archive",
          disabled: item.stock === 0,
          clickHandler: () => alert(`Archive: ${item.name}`),
        },
        {
          icon: "lucide-trash-2",
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
  }),
};

/**
 * Row Actions in Column Position (Inline Mode)
 *
 * Actions render in a dedicated fixed zone to the right of the row.
 * Always visible — no hover required. Uses inline mode (quick action buttons).
 */

export const WithRowActionsInlineColumn: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);
      const eventLog = ref<string[]>([]);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-eye",
          title: "View",
          clickHandler: () => {
            eventLog.value.unshift(`View: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-pencil",
          title: "Edit",
          clickHandler: () => {
            eventLog.value.unshift(`Edit: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
        {
          icon: "lucide-trash-2",
          title: "Delete",
          variant: "danger" as const,
          clickHandler: () => {
            products.value = products.value.filter((p) => p.id !== item.id);
            eventLog.value.unshift(`Deleted: ${item.name}`);
            if (eventLog.value.length > 5) eventLog.value.pop();
          },
        },
      ];

      return { products, eventLog, getRowActions };
    },
    template: `
    <div style="height: 500px">
      <p class="tw-mb-4 tw-text-sm tw-text-neutrals-500">
        Actions are always visible in a dedicated column — no hover needed.
      </p>
      <div class="tw-mb-2">
        <span v-for="(event, i) in eventLog" :key="i" class="tw-text-sm tw-mr-2">{{ event }}</span>
      </div>
      <VcDataTable
        :items="products"
        :row-actions="getRowActions"
        row-actions-mode="inline"
        row-actions-position="column"
        :max-quick-actions="3"
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
 * Row Actions Dropdown in Column Position
 *
 * Three-dot menu in a dedicated column, always visible.
 * Combines dropdown mode with column position.
 */

export const WithRowActionsDropdownColumn: Story = {
  render: () => ({
    components: { VcDataTable, VcColumn },
    setup() {
      const products = ref([...mockProducts]);

      const getRowActions = (item: Product) => [
        {
          icon: "lucide-eye",
          title: "View details",
          clickHandler: () => alert(`View: ${item.name}`),
        },
        {
          icon: "lucide-pencil",
          title: "Edit",
          clickHandler: () => alert(`Edit: ${item.name}`),
        },
        {
          icon: "lucide-trash-2",
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
        Three-dot menu always visible in dedicated column. Click to open dropdown.
      </p>
      <VcDataTable
        :items="products"
        :row-actions="getRowActions"
        row-actions-mode="dropdown"
        row-actions-position="column"
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

// =============================================================================
// LINE CLAMP
// =============================================================================

/**
 * Text Line Clamp
 *
 * Demonstrates the lineClamp prop for limiting text to a specific number of lines.
 */
