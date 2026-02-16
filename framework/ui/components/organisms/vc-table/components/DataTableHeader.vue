<template>
  <TableHeader>
    <TableRow variant="header" :show-drag-handle="showDragHandle">
      <!-- Selection column (only if NOT defined via VcColumn) -->
      <TableHead
        v-if="showSelectionCell"
        class="vc-data-table__selection-cell"
      >
        <TableCheckbox
          v-if="selectionMode === 'multiple'"
          :model-value="allSelected"
          :indeterminate="someSelected"
          @update:model-value="handleSelectAllChange"
        />
      </TableHead>

      <!-- Data columns from VcColumn -->
      <TableHead
        v-for="col in columns"
        :ref="(el) => setHeaderRef(col.props.id, el as HTMLElement)"
        :key="col.props.id"
        :width="getColumnWidth(col.props)"
        :align="getHeaderAlign(col.props)"
        :sortable="col.props.sortable"
        :sort-direction="getSortDirection(getSortField(col.props))"
        :sort-index="getSortIndex(getSortField(col.props))"
        :column-id="col.props.id"
        :resizable="isColumnResizable(col.props)"
        :reorderable="isColumnReorderable(col.props)"
        :is-last-resizable="isLastResizable(col.props)"
        :style="getHeaderStyle(col.props)"
        @sort="handleSort(col.props, $event)"
        @resize-start="handleResizeStart"
        @reorder-drag-start="handleReorderDragStart"
        @reorder-drag-over="handleReorderDragOver"
        @reorder-drop="handleReorderDrop"
      >
        <!-- Selection column header (checkbox for multiple) -->
        <template v-if="col.props.selectionMode">
          <TableCheckbox
            v-if="col.props.selectionMode === 'multiple'"
            :model-value="allSelected"
            :indeterminate="someSelected"
            @update:model-value="handleSelectAllChange"
          />
        </template>
        <!-- Expander/RowReorder column header (empty) -->
        <template v-else-if="col.props.expander || col.props.rowReorder" />
        <!-- Custom header slot from VcColumn -->
        <template v-else-if="col.slots.header">
          <SlotProxy :slot-fn="col.slots.header!" :scope="{ column: col.props }" />
        </template>
        <!-- Default header content -->
        <template v-else>
          <div class="vc-data-table__header-content">
            <span class="vc-data-table__header-title">{{ col.props.title }}</span>
            <ColumnFilter
              v-if="showFilter(col)"
              :field="col.props.filterField || col.props.field || col.props.id"
              :filter-type="getFilterType(col)"
              :filter-options="getFilterOptions(col)"
              :multiple="isFilterMultiple(col)"
              :range-fields="getRangeFields(col)"
              :placeholder="col.props.filterPlaceholder"
              :model-value="getFilterValue(col)"
              @apply="handleFilterApply(col, $event)"
              @clear="handleFilterClear(col)"
            >
              <template v-if="col.slots.filter" #filter="{ value, updateValue, startDate, updateStartDate, endDate, updateEndDate, applyFilter, clearFilter }">
                <SlotProxy :slot-fn="col.slots.filter!" :scope="{ field: col.props.field, value, updateValue, startDate, updateStartDate, endDate, updateEndDate, applyFilter, clearFilter }" />
              </template>
            </ColumnFilter>
          </div>
        </template>
      </TableHead>
      <!-- Column switcher icon button (absolute-positioned, doesn't affect column widths) -->
      <template v-if="showColumnSwitcher" #actions>
        <VcButton
          ref="columnSwitcherBtnRef"
          variant="ghost"
          size="icon"
          icon="fas fa-columns"
          icon-size="s"
          class="vc-data-table__header-col-switcher"
          :class="{ 'vc-data-table__header-col-switcher--active': columnSwitcherActive }"
          @click.stop="emit('column-switcher-click')"
        />
      </template>
    </TableRow>
  </TableHeader>
</template>

<script setup lang="ts">
/**
 * DataTableHeader - Reusable header rendering component for VcDataTable
 *
 * Extracts header rendering logic from VcDataTable.vue to provide
 * a single, unified component for rendering table headers.
 *
 * Features:
 * - Selection column (checkbox for select-all in multiple mode)
 * - Column headers with sort indicators
 * - Column filters
 * - Resize handles
 * - Reorder drag handles
 * - Custom header slots from VcColumn
 */
import { computed, ref } from "vue";
import type { ColumnInstance } from "../utils/ColumnCollector";
import type { VcColumnProps, FilterType, FilterOption, FilterValue } from "../types";
import TableHeader from "./TableHeader.vue";
import TableRow from "./TableRow.vue";
import TableHead from "./TableHead.vue";
import TableCheckbox from "./TableCheckbox.vue";
import ColumnFilter from "./ColumnFilter.vue";
import { VcIcon, VcButton } from "../../../atoms";
import { SlotProxy } from "./_internal/SlotProxy";

// Props interface
const props = defineProps<{
  /** Column instances from ColumnCollector */
  columns: ColumnInstance[];

  // === Selection ===
  /** Whether to show selection cell (checkbox/radio) */
  showSelectionCell?: boolean;
  /** Selection mode: 'single' or 'multiple' */
  selectionMode?: "single" | "multiple";
  /** Whether all rows are selected */
  allSelected?: boolean;
  /** Whether some (but not all) rows are selected */
  someSelected?: boolean;

  // === Sort helpers ===
  /** Function to get sort direction for a field */
  getSortDirection: (field: string) => "asc" | "desc" | undefined;
  /** Function to get sort index for multi-sort */
  getSortIndex: (field: string) => number | undefined;

  // === Column helpers ===
  /** Function to get effective column width */
  getColumnWidth: (colProps: VcColumnProps) => string | undefined;
  /** Function to get header alignment */
  getHeaderAlign: (colProps: VcColumnProps) => "left" | "center" | "right" | undefined;
  /** Function to get header style */
  getHeaderStyle: (colProps: VcColumnProps) => Record<string, string> | object | undefined;
  /** Function to check if column is resizable */
  isColumnResizable: (colProps: VcColumnProps) => boolean;
  /** Function to check if column is reorderable */
  isColumnReorderable: (colProps: VcColumnProps) => boolean;
  /** Function to check if column is the last resizable one */
  isLastResizable: (colProps: VcColumnProps) => boolean;
  /** Function to get sort field for a column */
  getSortField: (colProps: VcColumnProps) => string;
  /** Function to set header ref for resize/reorder tracking */
  setHeaderRef: (columnId: string, el: HTMLElement | null) => void;

  // === Filter helpers ===
  /** Function to check if filter should be shown for column */
  showFilter: (col: ColumnInstance) => boolean;
  /** Function to get filter type for column */
  getFilterType: (col: ColumnInstance) => FilterType;
  /** Function to get filter options for column */
  getFilterOptions: (col: ColumnInstance) => FilterOption[] | undefined;
  /** Function to check if filter allows multiple selection */
  isFilterMultiple: (col: ColumnInstance) => boolean;
  /** Function to get range fields for dateRange filter */
  getRangeFields: (col: ColumnInstance) => [string, string] | undefined;
  /** Function to get current filter value for column */
  getFilterValue: (col: ColumnInstance) => FilterValue;

  // === Column switcher ===
  /** Whether to show drag handle spacer (aligns header with body rows that have drag handles) */
  showDragHandle?: boolean;

  /** Whether to show the column switcher icon in header row */
  showColumnSwitcher?: boolean;
  /** Whether the column switcher panel is currently open */
  columnSwitcherActive?: boolean;
}>();

// Emits
const emit = defineEmits<{
  /** Select all checkbox changed */
  "select-all": [value: boolean];
  /** Column sort requested */
  sort: [col: VcColumnProps, event?: Event];
  /** Column resize started */
  "resize-start": [columnId: string, event: MouseEvent];
  /** Column reorder drag started */
  "reorder-start": [columnId: string, event: DragEvent];
  /** Column reorder drag over */
  "reorder-over": [event: DragEvent];
  /** Column reorder drop */
  "reorder-drop": [columnId: string, event: DragEvent];
  /** Column filter applied */
  "filter-apply": [col: ColumnInstance, payload: Record<string, unknown>];
  /** Column filter cleared */
  "filter-clear": [col: ColumnInstance];
  /** Column switcher icon clicked */
  "column-switcher-click": [];
}>();

// Column switcher button ref (exposed for anchor positioning)
const columnSwitcherBtnRef = ref<InstanceType<typeof VcButton> | null>(null);

defineExpose({
  /** The column switcher button element (for dropdown anchor positioning) */
  columnSwitcherEl: computed(() => (columnSwitcherBtnRef.value as any)?.$el as HTMLElement | null),
});

// Event handlers

const handleSelectAllChange = (value?: boolean) => {
  emit("select-all", value ?? false);
};

const handleSort = (colProps: VcColumnProps, event: MouseEvent) => {
  emit("sort", colProps, event);
};

const handleResizeStart = (columnId: string | undefined, event: MouseEvent) => {
  if (columnId) {
    emit("resize-start", columnId, event);
  }
};

const handleReorderDragStart = (columnId: string | undefined, event: DragEvent) => {
  if (columnId) {
    emit("reorder-start", columnId, event);
  }
};

const handleReorderDragOver = (event: DragEvent) => {
  emit("reorder-over", event);
};

const handleReorderDrop = (columnId: string | undefined, event: DragEvent) => {
  if (columnId) {
    emit("reorder-drop", columnId, event);
  }
};

const handleFilterApply = (col: ColumnInstance, payload: Record<string, unknown>) => {
  emit("filter-apply", col, payload);
};

const handleFilterClear = (col: ColumnInstance) => {
  emit("filter-clear", col);
};
</script>

<style lang="scss">
.vc-data-table__header-col-switcher {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: var(--table-header-bg, #f9fafb);
  box-shadow: -8px 0 8px var(--table-header-bg, #f9fafb);
  color: var(--table-header-text-color, var(--neutrals-500));
  cursor: pointer;
  opacity: 0.7;
  transition: background-color 0.15s, color 0.15s, opacity 0.15s;
  z-index: 11;

  &:hover,
  &--active {
    background-color: var(--primary-50);
    box-shadow: -8px 0 8px var(--primary-50);
    color: var(--primary-600);
    opacity: 1;
  }
}
</style>

