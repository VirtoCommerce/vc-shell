<template>
  <div
    class="vc-data-table__body"
    @scroll="$emit('scroll', $event)"
  >
    <!-- Empty state -->
    <template v-if="items.length === 0 && !loading">
      <slot name="empty">
        <TableEmpty
          :title="emptyTitle"
          :description="emptyDescription"
        />
      </slot>
    </template>

    <!-- Loading state -->
    <template v-else-if="loading && items.length === 0">
      <slot name="loading">
        <div class="vc-data-table__loading">
          <span>{{ loadingText }}</span>
        </div>
      </slot>
    </template>

    <!-- Rows — single unified loop for both grouped and non-grouped modes -->
    <TransitionGroup
      v-else
      tag="div"
      name="vc-table-row-swap"
      class="vc-data-table__rows-container"
    >
      <DataTableRow
        v-for="(item, index) in iterationItems"
        :key="getItemKey(item, index)"
        v-bind="getRowProps(item, getEffectiveIndex(item, index))"
        :grouping-enabled="groupingEnabled"
        :group-key="groupingEnabled ? getGroupKey(item) : undefined"
        :is-first-in-group="groupingEnabled ? isFirstInGroup(index) : false"
        :is-last-in-group="groupingEnabled ? isLastInGroup(index) : false"
        :group-count="groupingEnabled && isFirstInGroup(index) ? (groupCountMap?.get(getGroupKey(item)) ?? 0) : 0"
        :expandable-row-groups="expandableRowGroups"
        :is-group-row-expanded="groupingEnabled ? isGroupExpanded(getGroupKey(item)) : true"
        @click="(e) => handleRowClick(item, getEffectiveIndex(item, index), e)"
        @mouseenter="handleRowMouseEnter"
        @mouseleave="handleRowMouseLeave"
        @selection-change="() => handleRowSelectionChange(item)"
        @expand-toggle="(e) => handleExpandToggle(item, getEffectiveIndex(item, index), e)"
        @row-edit="() => handleRowEdit(item, getEffectiveIndex(item, index))"
        @row-save="() => handleRowSave(item, getEffectiveIndex(item, index))"
        @row-cancel="() => handleRowCancel(item, getEffectiveIndex(item, index))"
        @edit-complete="(field, value) => handleEditComplete(item, field, getEffectiveIndex(item, index), value)"
        @edit-cancel="(field) => handleEditCancel(item, field, getEffectiveIndex(item, index))"
        @cell-value-change="(field, value) => handleCellValueChange(field, getEffectiveIndex(item, index), value)"
        @cell-click="
          (col) => handleCellClick(item, col.props.field || col.props.id, getEffectiveIndex(item, index), col)
        "
        @group-toggle="(e) => handleGroupToggle(getGroupKey(item), e)"
        @mousedown="handleRowMouseDown"
        @dragstart="(e) => handleRowDragStart(e, item)"
        @dragover="(e) => handleRowDragOver(e, item)"
        @dragleave="handleRowDragLeave"
        @dragend="handleRowDragEnd"
        @drop="handleRowDrop"
      >
        <template #actions>
          <slot
            name="row-actions"
            :item="item"
            :index="getEffectiveIndex(item, index)"
          />
        </template>
        <template #expansion>
          <slot
            name="expansion"
            :data="item"
            :index="getEffectiveIndex(item, index)"
          />
        </template>
        <template #groupheader="slotProps">
          <slot
            name="groupheader"
            v-bind="slotProps"
          />
        </template>
        <template #groupfooter="slotProps">
          <slot
            name="groupfooter"
            v-bind="slotProps"
          />
        </template>
      </DataTableRow>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
/**
 * DataTableBody - Reusable body rendering component for VcDataTable
 *
 * Extracts body rendering logic from VcDataTable.vue to provide
 * a single, unified component for rendering table body content.
 *
 * Note: This is an internal sub-component of VcDataTable. It does NOT declare
 * its own generic — instead it uses Record<string, any> for item types.
 * Type safety is enforced at the VcDataTable level (which has generic="T").
 * This avoids vue-tsc generic unification issues between parent and child.
 *
 * Features:
 * - Empty and loading states
 * - Unified row loop for both grouped and non-grouped modes
 * - Group context (header/footer) passed as props to DataTableRow
 * - Row click, selection, editing events
 * - Drag & drop for row reorder
 * - Slots for actions, expansion, group header/footer
 */
import { computed, TransitionGroup } from "vue";
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import type { VcColumnProps } from "@ui/components/organisms/vc-table/types";
import type { GroupedData } from "@ui/components/organisms/vc-table/composables/useTableRowGrouping";
import DataTableRow from "@ui/components/organisms/vc-table/components/DataTableRow.vue";
import TableEmpty from "@ui/components/organisms/vc-table/components/TableEmpty.vue";

/**
 * Base item type — actual generic enforcement happens in VcDataTable.
 * Uses `any` (not Record<string, any>) because TypeScript doesn't allow
 * Record<string, any> → T assignment even when T extends Record<string, any>.
 * This is safe: DataTableBody is an internal sub-component only used by VcDataTable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;

// Row props return type (mirrors getRowProps in VcDataTable)
// This matches DataTableRow props exactly - exported for external use
export interface RowProps<T> {
  item: T;
  index: number;
  columns: ColumnInstance[];
  isSelected: boolean;
  isSelectable: boolean;
  selectionMode?: "single" | "multiple";
  showSelectionCell: boolean;
  reorderable: boolean;
  showDragHandle: boolean;
  isDragging: boolean;
  expandable: boolean;
  isExpanded: boolean;
  expandedIcon: string;
  collapsedIcon: string;
  editingRowData: T; // DataTableRow requires T, not T | null
  isRowEditing: boolean;
  isInlineEditing: boolean;
  isCellEditing: (rowIndex: number, field: string) => boolean; // Match DataTableRow signature
  hasActions: boolean;
  getColumnWidth: (colProps: VcColumnProps) => string | undefined;
  getCellAlign: (colProps: VcColumnProps) => "left" | "center" | "right" | undefined;
  getCellStyle: (colProps: VcColumnProps) => Record<string, string> | object | undefined;
  rowClass?: string | Record<string, boolean> | (string | Record<string, boolean> | undefined)[];
}

// Props
const props = defineProps<{
  /** Items to render */
  items: Item[];
  /** Loading state */
  loading?: boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Loading text */
  loadingText?: string;

  // === Grouping ===
  /** Whether grouping is enabled */
  groupingEnabled?: boolean;
  /** Grouped data */
  groupedData?: GroupedData<Item>[];
  /** Whether row groups are expandable */
  expandableRowGroups?: boolean;
  /** Function to check if group is expanded */
  isGroupExpanded: (key: string) => boolean;
  /** Function to get the group key for an item */
  getItemGroupKey?: (item: Item) => string;
  /** Function to get global index of an item */
  getGlobalIndex: (item: Item) => number;
  /** Function to get item key */
  getItemKey: (item: Item, index: number) => string | number;
  /** Function to build row props */
  getRowProps: (item: Item, index: number) => RowProps<Item>;
}>();

// Emits - matches DataTableRow emit signatures
const emit = defineEmits<{
  /** Scroll event from body container */
  scroll: [event: Event];
  /** Group expansion toggled */
  "group-toggle": [key: string, event?: Event];
  /** Row clicked */
  "row-click": [item: Item, index: number, event: MouseEvent];
  /** Row mouse enter (DataTableRow emits index) */
  "row-mouseenter": [index: number];
  /** Row mouse leave (DataTableRow emits nothing) */
  "row-mouseleave": [];
  /** Row selection changed */
  "selection-change": [item: Item];
  /** Row expand toggled */
  "expand-toggle": [item: Item, index: number, event?: Event];
  /** Row edit started */
  "row-edit": [item: Item, index: number];
  /** Row save */
  "row-save": [item: Item, index: number];
  /** Row cancel */
  "row-cancel": [item: Item, index: number];
  /** Cell edit completed */
  "edit-complete": [item: Item, field: string, index: number, value: unknown];
  /** Cell edit cancelled */
  "edit-cancel": [item: Item, field: string, index: number];
  /** Cell value changed */
  "cell-value-change": [field: string, index: number, value: unknown];
  /** Cell clicked */
  "cell-click": [item: Item, field: string, index: number, column: ColumnInstance];
  /** Row mouse down (for reorder) */
  "row-mousedown": [event: MouseEvent];
  /** Row drag start */
  "row-dragstart": [event: DragEvent, item: Item];
  /** Row drag over */
  "row-dragover": [event: DragEvent, item: Item];
  /** Row drag leave */
  "row-dragleave": [event: DragEvent];
  /** Row drag end */
  "row-dragend": [event: DragEvent];
  /** Row drop */
  "row-drop": [event: DragEvent];
}>();

// ============================================================================
// Grouping computed helpers
// ============================================================================

/** Flatten grouped data to maintain group ordering when grouping is enabled */
const iterationItems = computed<Item[]>(() => {
  if (props.groupingEnabled && props.groupedData?.length) {
    return props.groupedData.flatMap((g) => g.items);
  }
  return props.items;
});

/** Group count lookup map (groupKey -> count) */
const groupCountMap = computed<Map<string, number> | null>(() => {
  if (!props.groupedData) return null;
  const map = new Map<string, number>();
  for (const g of props.groupedData) {
    map.set(g.key, g.count);
  }
  return map;
});

/** Get the group key for an item */
const getGroupKey = (item: Item): string => props.getItemGroupKey?.(item) ?? "";

/** Check if item at index is the first in its group (adjacent comparison) */
const isFirstInGroup = (index: number): boolean =>
  index === 0 || getGroupKey(iterationItems.value[index]) !== getGroupKey(iterationItems.value[index - 1]);

/** Check if item at index is the last in its group (adjacent comparison) */
const isLastInGroup = (index: number): boolean =>
  index === iterationItems.value.length - 1 ||
  getGroupKey(iterationItems.value[index]) !== getGroupKey(iterationItems.value[index + 1]);

/** Get the effective index for an item (global index for grouped, local index for non-grouped) */
const getEffectiveIndex = (item: Item, localIndex: number): number => {
  if (props.groupingEnabled) {
    return props.getGlobalIndex(item);
  }
  return localIndex;
};

// ============================================================================
// Event handlers - delegate to parent (match DataTableRow signatures)
// ============================================================================

const handleGroupToggle = (key: string, e?: Event) => emit("group-toggle", key, e);
const handleRowClick = (item: Item, index: number, e: MouseEvent) => emit("row-click", item, index, e);
const handleRowMouseEnter = (index: number) => emit("row-mouseenter", index);
const handleRowMouseLeave = () => emit("row-mouseleave");
const handleRowSelectionChange = (item: Item) => emit("selection-change", item);
const handleExpandToggle = (item: Item, index: number, e?: Event) => emit("expand-toggle", item, index, e);
const handleRowEdit = (item: Item, index: number) => emit("row-edit", item, index);
const handleRowSave = (item: Item, index: number) => emit("row-save", item, index);
const handleRowCancel = (item: Item, index: number) => emit("row-cancel", item, index);
const handleEditComplete = (item: Item, field: string, index: number, value: unknown) =>
  emit("edit-complete", item, field, index, value);
const handleEditCancel = (item: Item, field: string, index: number) => emit("edit-cancel", item, field, index);
const handleCellValueChange = (field: string, index: number, value: unknown) =>
  emit("cell-value-change", field, index, value);
const handleCellClick = (item: Item, field: string, index: number, column: ColumnInstance) =>
  emit("cell-click", item, field, index, column);
const handleRowMouseDown = (e: MouseEvent) => emit("row-mousedown", e);
const handleRowDragStart = (e: DragEvent, item: Item) => emit("row-dragstart", e, item);
const handleRowDragOver = (e: DragEvent, item: Item) => emit("row-dragover", e, item);
const handleRowDragLeave = (e: DragEvent) => emit("row-dragleave", e);
const handleRowDragEnd = (e: DragEvent) => emit("row-dragend", e);
const handleRowDrop = (e: DragEvent) => emit("row-drop", e);
</script>

<style lang="scss">
.vc-data-table__body {
  @apply tw-flex tw-flex-col tw-overflow-y-auto tw-flex-auto tw-min-h-0;
}

.vc-data-table__loading {
  @apply tw-p-4 tw-text-center tw-text-neutrals-500;
}

.vc-data-table__rows-container {
  @apply tw-flex tw-flex-col;
}

.vc-data-table__group-label {
  @apply tw-font-medium;
}

.vc-data-table__group-count {
  @apply tw-ml-1 tw-text-neutrals-500;
}

.vc-data-table__group-footer {
  @apply tw-px-4 tw-py-2 tw-bg-neutrals-50;
}

/* Row swap animation */
.vc-table-row-swap-move {
  transition: transform 0.3s ease;
}
</style>
