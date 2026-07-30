import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, onMounted, onUnmounted } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcInput } from "@ui/components/molecules";
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

export const InlineEditingWithValidation: Story = {
  render: () => ({
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
  }),
};
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

export const CustomAddRowButton: Story = {
  render: () => ({
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
  }),
};
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
