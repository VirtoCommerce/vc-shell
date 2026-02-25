<template>
  <!-- Selection column body (checkbox for multiple, radio for single) -->
  <template v-if="column.props.selectionMode">
    <TableCheckbox
      v-if="column.props.selectionMode === 'multiple'"
      :model-value="isSelected"
      :disabled="!isSelectable"
      @update:model-value="$emit('selection-change', $event)"
    />
    <VcRadioButton
      v-else
      :model-value="isSelected"
      :value="true"
      :disabled="!isSelectable"
      @update:model-value="$emit('selection-change', true)"
    />
  </template>

  <!-- Expander column body (expand/collapse button) -->
  <template v-else-if="column.props.expander">
    <button
      type="button"
      class="vc-cell-renderer__expander-btn"
      :data-is-expanded="isExpanded"
      @click.stop="$emit('expand-toggle', $event)"
    >
      <i
        :class="isExpanded ? expandedIcon : collapsedIcon"
        class="vc-cell-renderer__expander-icon"
      />
    </button>
  </template>

  <!-- Row reorder column: empty placeholder (handle is rendered by TableRow) -->
  <template v-else-if="column.props.rowReorder">
    <div class="vc-cell-renderer__row-reorder-placeholder" />
  </template>

  <!-- Row editor column (Edit/Save/Cancel buttons) -->
  <template v-else-if="column.props.rowEditor">
    <div class="vc-cell-renderer__row-editor">
      <template v-if="isRowEditing">
        <button
          type="button"
          class="vc-cell-renderer__row-editor-btn vc-cell-renderer__row-editor-btn--save"
          @click.stop="$emit('row-save')"
        >
          ✓
        </button>
        <button
          type="button"
          class="vc-cell-renderer__row-editor-btn vc-cell-renderer__row-editor-btn--cancel"
          @click.stop="$emit('row-cancel')"
        >
          ✕
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="vc-cell-renderer__row-editor-btn vc-cell-renderer__row-editor-btn--edit"
          @click.stop="$emit('row-edit')"
        >
          ✎
        </button>
      </template>
    </div>
  </template>

  <!-- Editor slot (when cell or row is being edited) -->
  <template v-else-if="column.slots.editor && (isCellEditing || (isRowEditing && column.props.editable))">
    <div
      class="vc-cell-renderer__editor-wrapper"
      @focusout="handleEditorFocusOut"
      @keydown="handleEditorKeyDown"
    >
      <SlotProxy
        :slot-fn="column.slots.editor!"
        :scope="{
          data: editingRowData,
          field: fieldName,
          index,
          editorCallback: handleEditorCallback,
          editorSaveCallback: completeEdit,
          editorCancelCallback: cancelEdit
        }"
      />
    </div>
  </template>

  <!-- Custom body slot from VcColumn -->
  <template v-else-if="column.slots.body || column.slots.default">
    <div class="vc-cell-renderer__body-slot">
      <SlotProxy
        :slot-fn="(column.slots.body || column.slots.default)!"
        :scope="{
          data: item,
          field: fieldName,
          index
        }"
      />
    </div>
  </template>

  <!-- Type-specific cell formatters with inline editing support -->
  <DynamicCellRenderer
    v-else
    :type="column.props.type || 'text'"
    :value="cellValue"
    :editable="isInlineEditing"
    :label="column.props.title || fieldName"
    :field-name="uniqueFieldName"
    :field-id="fieldName"
    :rules="column.props.rules"
    :row-index="index"
    :currency="currency"
    :format="column.props.format"
    :variant="dateVariant"
    @update="handleCellUpdate"
    @blur="handleCellBlur"
  />
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * DataTableCellRenderer - Renders cell content based on column configuration
 *
 * Handles all cell types and special columns (selection, expander, rowEditor, rowReorder).
 * Extracted from VcDataTable.vue to reduce template complexity.
 */
import { computed } from "vue";
import { get } from "lodash-es";
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import TableCheckbox from "@ui/components/organisms/vc-table/components/TableCheckbox.vue";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";
import DynamicCellRenderer from "@ui/components/organisms/vc-table/components/cells/DynamicCellRenderer.vue";
import { SlotProxy } from "@ui/components/organisms/vc-table/components/_internal/SlotProxy";

const props = defineProps<{
  /** Column instance from ColumnCollector */
  column: ColumnInstance;
  /** Row data item (original) */
  item: T;
  /** Row data for editing (copy from editingMeta, or same as item if not editing) */
  editingRowData: T;
  /** Row index */
  index: number;
  /** Is this cell currently being edited */
  isCellEditing?: boolean;
  /** Is this row currently being edited */
  isRowEditing?: boolean;
  /** Is this row selected */
  isSelected?: boolean;
  /** Can this row be selected */
  isSelectable?: boolean;
  /** Is this row expanded */
  isExpanded?: boolean;
  /** Icon for expanded state */
  expandedIcon?: string;
  /** Icon for collapsed state */
  collapsedIcon?: string;
}>();

const emit = defineEmits<{
  /** Selection checkbox changed */
  "selection-change": [value: boolean];
  /** Expand/collapse toggled */
  "expand-toggle": [event: Event];
  /** Row edit started */
  "row-edit": [];
  /** Row edit saved */
  "row-save": [];
  /** Row edit cancelled */
  "row-cancel": [];
  /** Cell edit completed with new value */
  "edit-complete": [value: unknown];
  /** Cell edit cancelled */
  "edit-cancel": [];
  /** Cell value changed during editing (for inline edit tracking) */
  "cell-value-change": [value: unknown];
}>();

/**
 * Editor callback - updates the value in editingRowData (the copy).
 * This doesn't trigger parent re-renders since editingRowData is a separate object.
 * Also emits cell-value-change for inline edit tracking.
 */
const handleEditorCallback = (value: unknown) => {
  const field = fieldName.value;
  if (field && props.editingRowData) {
    // Update the copy - this won't trigger re-renders of the table
    (props.editingRowData as Record<string, unknown>)[field] = value;
  }
  // Emit value change for inline edit dirty tracking
  emit("cell-value-change", value);
};

/**
 * Complete editing and emit the final value.
 * Called when user finishes editing (blur/Enter).
 */
const completeEdit = () => {
  const field = fieldName.value;
  const newValue = field ? (props.editingRowData as Record<string, unknown>)[field] : undefined;
  emit("edit-complete", newValue);
};

/**
 * Cancel editing.
 * Called when user presses Escape.
 */
const cancelEdit = () => {
  emit("edit-cancel");
};

/**
 * Handle focusout from editor wrapper.
 * Completes editing when focus leaves the editor.
 */
const handleEditorFocusOut = (event: FocusEvent) => {
  // Check if focus is moving to another element within the editor
  const wrapper = (event.currentTarget as HTMLElement);
  const relatedTarget = event.relatedTarget as HTMLElement | null;

  // If focus is staying within the wrapper, don't complete
  if (relatedTarget && wrapper.contains(relatedTarget)) {
    return;
  }

  // Focus left the editor - complete the edit
  completeEdit();
};

/**
 * Handle keydown in editor wrapper.
 * Enter = save, Escape = cancel.
 */
const handleEditorKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    completeEdit();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancelEdit();
  }
};

// Field name from column
const fieldName = computed(() => props.column.props.field || props.column.props.id);

// Unique field name for VeeValidate (includes row index to prevent conflicts)
const uniqueFieldName = computed(() => `${fieldName.value}_${props.index}`);

// Check if this cell should be in inline editing mode
// This is true when:
// 1. Cell-level editing (isCellEditing) OR
// 2. Row-level editing (isRowEditing) AND column is marked as editable
// AND no custom editor slot is provided (custom editors handle their own rendering)
const isInlineEditing = computed(() => {
  if (props.column.slots.editor) return false; // Custom editor handles its own rendering
  return props.isCellEditing || (props.isRowEditing && props.column.props.editable);
});

// Get cell value using lodash _.get for nested fields
const cellValue = computed(() => {
  return get(props.item, fieldName.value || "");
});

// Currency for money cells
const currency = computed(() => {
  const field = props.column.props.currencyField || "currency";
  return (props.item as Record<string, unknown>)[field] as string || "USD";
});

// Date variant based on column type
const dateVariant = computed<"date" | "time" | "date-time">(() => {
  const type = props.column.props.type;
  if (type === "time") return "time";
  if (type === "datetime") return "date-time";
  return "date";
});

/**
 * Handle cell update from Cell components (CellDefault, CellMoney, CellNumber).
 * Updates editingRowData and emits cell-value-change for dirty tracking.
 */
const handleCellUpdate = (payload: { field: string; value: unknown }) => {
  const field = fieldName.value;
  if (field && props.editingRowData) {
    (props.editingRowData as Record<string, unknown>)[field] = payload.value;
  }
  emit("cell-value-change", payload.value);
};

/**
 * Handle blur from Cell components.
 * Can be used for additional logic if needed.
 */
const handleCellBlur = (_payload: { row: number | undefined; field: string }) => {
  // Complete edit on blur when using DynamicCellRenderer path (no custom #editor slot):
  // 1. Cell editing mode (isCellEditing) — single cell click-to-edit
  // 2. Inline editing mode (isRowEditing && editable) — all editable cells always active
  if (!props.column.slots.editor && (props.isCellEditing || (props.isRowEditing && props.column.props.editable))) {
    completeEdit();
  }
};
</script>

<style lang="scss">
.vc-cell-renderer {
  &__body-slot {
    @apply tw-w-full tw-min-w-0 tw-overflow-hidden;

    // Ensure custom slot roots can shrink with the cell width.
    // This fixes truncation/clamp behavior for components that set intrinsic width (e.g. max-content/fit-content).
    > * {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    // Allow nested flex/text containers inside custom cells to shrink and truncate.
    > * * {
      min-width: 0;
    }

    // Common case for custom status-like cells (e.g. VcStatus in body slot):
    // force the badge container to follow cell width so internal truncate can show ellipsis.
    .vc-status {
      width: 100% !important;
      max-width: 100% !important;
    }

    .vc-status__content {
      min-width: 0 !important;
    }
  }

  &__editor-wrapper {
    @apply tw-w-full tw-h-full;
  }

  &__default-editor {
    @apply tw-w-full tw-h-8 tw-px-2 tw-py-1 tw-text-sm tw-border tw-rounded;
    @apply tw-border-primary-300 tw-outline-none;
    @apply focus:tw-border-primary-500 focus:tw-ring-1 focus:tw-ring-primary-200;
  }

  &__expander-btn {
    @apply tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-rounded tw-cursor-pointer tw-transition-colors;
    @apply tw-bg-transparent tw-border-0;
    @apply hover:tw-bg-neutrals-100;
  }

  &__expander-icon {
    @apply tw-text-neutrals-500 tw-text-xs;
  }

  &__drag-handle {
    @apply tw-cursor-grab tw-text-neutrals-400;
    @apply hover:tw-text-neutrals-600;
  }

  &__row-editor {
    @apply tw-flex tw-gap-1 tw-justify-center tw-items-center;
  }

  &__row-editor-btn {
    @apply tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-rounded tw-border tw-cursor-pointer tw-transition-colors;

    &--edit {
      @apply tw-border-neutrals-300 tw-bg-additional-50 tw-text-neutrals-600;

      &:hover {
        @apply tw-bg-neutrals-100 tw-border-neutrals-400;
      }
    }

    &--save {
      @apply tw-border-success-300 tw-bg-success-50 tw-text-success-600;

      &:hover {
        @apply tw-bg-success-100 tw-border-success-400;
      }
    }

    &--cancel {
      @apply tw-border-danger-300 tw-bg-danger-50 tw-text-danger-600;

      &:hover {
        @apply tw-bg-danger-100 tw-border-danger-400;
      }
    }
  }
}
</style>
