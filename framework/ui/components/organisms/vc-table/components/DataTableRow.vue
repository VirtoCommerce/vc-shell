<template>
  <div class="vc-data-table__row-wrapper">
    <!-- Group header (before main row, only for first item in group) -->
    <TableGroupRow
      v-if="groupingEnabled && isFirstInGroup"
      :group-key="groupKey ?? ''"
      :count="groupCount ?? 0"
      :expandable="expandableRowGroups"
      :expanded="isGroupRowExpanded"
      @toggle="handleGroupToggle"
    >
      <slot name="groupheader" :data="item" :index="index">
        <span class="vc-data-table__group-label">{{ groupKey }}</span>
        <span class="vc-data-table__group-count">({{ groupCount }})</span>
      </slot>
    </TableGroupRow>

    <!-- Main row (hidden when group is collapsed) -->
    <TableRow
      v-if="!groupingEnabled || !expandableRowGroups || isGroupRowExpanded"
      :selected="isSelected"
      :reorderable="reorderable"
      :show-drag-handle="showDragHandle"
      :index="index"
      :clickable="true"
      :class="rowClass"
      @click="handleRowClick"
      @mouseenter="handleRowMouseEnter"
      @mouseleave="handleRowMouseLeave"
      @mousedown="handleMouseDown"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragend="handleDragEnd"
      @drop="handleDrop"
    >
      <!-- Selection control (only if NOT defined via VcColumn) -->
      <!-- @click.stop prevents checkbox/radio click from bubbling to row-click -->
      <TableCell
        v-if="showSelectionCell"
        class="vc-data-table__selection-cell"
        @click.stop
      >
        <TableCheckbox
          v-if="selectionMode === 'multiple'"
          :model-value="isSelected"
          :disabled="!isSelectable"
          @update:model-value="handleSelectionChange"
        />
        <VcRadioButton
          v-else
          :model-value="isSelected"
          :value="true"
          :disabled="!isSelectable"
          @update:model-value="handleSelectionChange"
        />
      </TableCell>

      <!-- Data cells -->
      <TableCell
        v-for="col in columns"
        :key="col.props.id"
        :column-id="col.props.id"
        :width="getColumnWidth(col.props)"
        :align="getCellAlign(col.props)"
        :cell-class="col.props.bodyClass"
        :line-clamp="col.props.lineClamp"
        :style="getCellStyle(col.props)"
        @click="handleCellClick(col)"
      >
        <DataTableCellRenderer
          :column="col"
          :item="item"
          :editing-row-data="editingRowData"
          :index="index"
          :is-cell-editing="isCellEditing(index, col.props.field || col.props.id)"
          :is-row-editing="isRowEditing || isInlineEditing"
          :is-selected="isSelected"
          :is-selectable="isSelectable"
          :is-expanded="isExpanded"
          :expanded-icon="expandedIcon"
          :collapsed-icon="collapsedIcon"
          @selection-change="handleCellSelectionChange"
          @expand-toggle="handleExpandToggle"
          @row-edit="handleRowEdit"
          @row-save="handleRowSave"
          @row-cancel="handleRowCancel"
          @edit-complete="handleEditComplete(col.props.field || col.props.id, $event)"
          @edit-cancel="handleEditCancel(col.props.field || col.props.id)"
          @cell-value-change="handleCellValueChange(col.props.field || col.props.id, $event)"
        />
      </TableCell>

      <!-- Row Actions (hover-visible) - use named slot for proper positioning -->
      <template v-if="hasActions" #actions>
        <slot name="actions" />
      </template>
    </TableRow>

    <!-- Expansion row (immediately after parent row, also hidden when group is collapsed) -->
    <div
      v-if="expandable && isExpanded && (!groupingEnabled || !expandableRowGroups || isGroupRowExpanded)"
      class="vc-data-table__expansion-row"
    >
      <div class="vc-data-table__expansion-content">
        <slot name="expansion" />
      </div>
    </div>

    <!-- Group footer (after last row in group) -->
    <div
      v-if="groupingEnabled && isLastInGroup && $slots.groupfooter && (!expandableRowGroups || isGroupRowExpanded)"
      class="vc-data-table__group-footer"
    >
      <slot name="groupfooter" :data="item" :index="index" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * DataTableRow - Reusable row rendering component for VcDataTable
 *
 * Extracts duplicated row rendering logic from VcDataTable.vue to provide
 * a single, unified component for rendering both grouped and non-grouped rows.
 *
 * Features:
 * - Selection (checkbox for multiple, radio for single)
 * - Cell rendering via DataTableCellRenderer
 * - Row actions slot
 * - Row reorder drag handles
 * - Row expansion support
 * - Inline editing support
 * - Group header/footer rendering (when grouping is enabled)
 */
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import type { VcColumnProps } from "@ui/components/organisms/vc-table/types";
import TableRow from "@ui/components/organisms/vc-table/components/TableRow.vue";
import TableCell from "@ui/components/organisms/vc-table/components/TableCell.vue";
import TableCheckbox from "@ui/components/organisms/vc-table/components/TableCheckbox.vue";
import TableGroupRow from "@ui/components/organisms/vc-table/components/TableGroupRow.vue";
import DataTableCellRenderer from "@ui/components/organisms/vc-table/components/DataTableCellRenderer.vue";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";

// Props interface
const props = defineProps<{
  /** Row data item */
  item: T;
  /** Row index in the data array */
  index: number;
  /** Column instances from ColumnCollector */
  columns: ColumnInstance[];

  // === Selection ===
  /** Whether this row is selected */
  isSelected?: boolean;
  /** Whether this row can be selected */
  isSelectable?: boolean;
  /** Selection mode: 'single' or 'multiple' */
  selectionMode?: "single" | "multiple";
  /** Whether to show selection cell (checkbox/radio) */
  showSelectionCell?: boolean;

  // === Reorder ===
  /** Whether row reordering is enabled */
  reorderable?: boolean;
  /** Whether to show drag handle icon */
  showDragHandle?: boolean;
  /** Whether this row is currently being dragged */
  isDragging?: boolean;

  // === Expansion ===
  /** Whether row expansion is enabled */
  expandable?: boolean;
  /** Whether this row is expanded */
  isExpanded?: boolean;
  /** Icon for expanded state */
  expandedIcon?: string;
  /** Icon for collapsed state */
  collapsedIcon?: string;

  // === Editing ===
  /** Row data for editing (copy from editingMeta, or same as item if not editing) */
  editingRowData: T;
  /** Whether this row is currently being edited */
  isRowEditing?: boolean;
  /** Whether inline editing mode is active for the table */
  isInlineEditing?: boolean;
  /** Function to check if a specific cell is being edited */
  isCellEditing: (rowIndex: number, field: string) => boolean;

  // === Actions ===
  /** Whether this row has actions to display */
  hasActions?: boolean;

  // === Column helpers ===
  /** Function to get effective column width */
  getColumnWidth: (colProps: VcColumnProps) => string | undefined;
  /** Function to get cell alignment */
  getCellAlign: (colProps: VcColumnProps) => "left" | "center" | "right" | undefined;
  /** Function to get cell style */
  getCellStyle: (colProps: VcColumnProps) => Record<string, string> | object | undefined;

  // === Custom class ===
  /** Additional row classes (e.g., for dragging state, user-provided rowClass) */
  rowClass?: string | Record<string, boolean> | (string | Record<string, boolean> | undefined)[];

  // === Grouping ===
  /** Whether grouping is enabled */
  groupingEnabled?: boolean;
  /** Group key for this row */
  groupKey?: string;
  /** Whether this row is the first in its group */
  isFirstInGroup?: boolean;
  /** Whether this row is the last in its group */
  isLastInGroup?: boolean;
  /** Number of items in the group (only meaningful for first item) */
  groupCount?: number;
  /** Whether row groups are expandable */
  expandableRowGroups?: boolean;
  /** Whether this row's group is currently expanded */
  isGroupRowExpanded?: boolean;
}>();

// Emits
const emit = defineEmits<{
  /** Row clicked */
  click: [event: MouseEvent];
  /** Mouse entered row */
  mouseenter: [index: number];
  /** Mouse left row */
  mouseleave: [];
  /** Selection changed (from selection cell) */
  "selection-change": [value?: boolean];
  /** Expand/collapse toggled */
  "expand-toggle": [event: Event];
  /** Row edit started */
  "row-edit": [];
  /** Row edit saved */
  "row-save": [];
  /** Row edit cancelled */
  "row-cancel": [];
  /** Cell edit completed */
  "edit-complete": [field: string, value: unknown];
  /** Cell edit cancelled */
  "edit-cancel": [field: string];
  /** Cell value changed during editing */
  "cell-value-change": [field: string, value: unknown];
  /** Cell clicked */
  "cell-click": [col: ColumnInstance];
  // === Drag events (for row reorder) ===
  /** Mouse down (for row reorder) */
  mousedown: [event: MouseEvent];
  /** Drag started */
  dragstart: [event: DragEvent];
  /** Drag over */
  dragover: [event: DragEvent];
  /** Drag leave */
  dragleave: [event: DragEvent];
  /** Drag ended */
  dragend: [event: DragEvent];
  /** Drop */
  drop: [event: DragEvent];
  /** Group expansion toggled */
  "group-toggle": [event: Event];
}>();

// Event handlers

const handleRowClick = (event: MouseEvent) => {
  // Skip row-click if click originated from a selection control (checkbox/radio)
  const target = event.target as HTMLElement;
  if (target?.closest(".vc-data-table__selection-cell, .vc-table-composition__checkbox, .vc-radio-button")) {
    return;
  }
  emit("click", event);
};

const handleRowMouseEnter = () => {
  emit("mouseenter", props.index);
};

const handleRowMouseLeave = () => {
  emit("mouseleave");
};

const handleSelectionChange = (value?: boolean) => {
  emit("selection-change", value);
};

const handleCellSelectionChange = (value: boolean) => {
  emit("selection-change", value);
};

const handleExpandToggle = (event: Event) => {
  emit("expand-toggle", event);
};

const handleRowEdit = () => {
  emit("row-edit");
};

const handleRowSave = () => {
  emit("row-save");
};

const handleRowCancel = () => {
  emit("row-cancel");
};

const handleEditComplete = (field: string, value: unknown) => {
  emit("edit-complete", field, value);
};

const handleEditCancel = (field: string) => {
  emit("edit-cancel", field);
};

const handleCellValueChange = (field: string, value: unknown) => {
  emit("cell-value-change", field, value);
};

const handleCellClick = (col: ColumnInstance) => {
  emit("cell-click", col);
};

const handleGroupToggle = (event: Event) => {
  emit("group-toggle", event);
};

// Drag event handlers (forwarded to parent for row reorder)
const handleMouseDown = (event: MouseEvent) => {
  if (props.reorderable) {
    emit("mousedown", event);
  }
};

const handleDragStart = (event: DragEvent) => {
  if (props.reorderable) {
    emit("dragstart", event);
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.reorderable) {
    emit("dragover", event);
  }
};

const handleDragLeave = (event: DragEvent) => {
  if (props.reorderable) {
    emit("dragleave", event);
  }
};

const handleDragEnd = (event: DragEvent) => {
  if (props.reorderable) {
    emit("dragend", event);
  }
};

const handleDrop = (event: DragEvent) => {
  if (props.reorderable) {
    emit("drop", event);
  }
};
</script>
