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
      <!-- Column switcher peek-tab (absolute-positioned, slides in on hover) -->
      <template v-if="showColumnSwitcher" #actions>
        <div
          class="vc-col-switcher-trigger"
          :class="{ 'vc-col-switcher-trigger--active': columnSwitcherActive }"
          role="button"
          tabindex="0"
          :aria-expanded="columnSwitcherActive"
          :aria-label="$t('COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.TITLE')"
          @click.stop="emit('column-switcher-click')"
          @keydown.enter.stop="emit('column-switcher-click')"
          @keydown.space.prevent.stop="emit('column-switcher-click')"
        >
          <span class="vc-col-switcher-trigger__chevron">
            <VcIcon icon="lucide-chevron-left" size="xs" :use-container="false" />
          </span>
          <VcTooltip placement="bottom">
            <span ref="columnSwitcherBtnRef" class="vc-col-switcher-trigger__action">
              <VcIcon icon="lucide-circle-plus" size="s" />
            </span>
            <template #tooltip>
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_SWITCHER.TITLE") }}
            </template>
          </VcTooltip>
        </div>
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
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import type { VcColumnProps, FilterType, FilterOption, FilterValue } from "@ui/components/organisms/vc-table/types";
import TableHeader from "@ui/components/organisms/vc-table/components/TableHeader.vue";
import TableRow from "@ui/components/organisms/vc-table/components/TableRow.vue";
import TableHead from "@ui/components/organisms/vc-table/components/TableHead.vue";
import TableCheckbox from "@ui/components/organisms/vc-table/components/TableCheckbox.vue";
import ColumnFilter from "@ui/components/organisms/vc-table/components/ColumnFilter.vue";
import { VcIcon, VcTooltip } from "@ui/components/atoms";
import { SlotProxy } from "@ui/components/organisms/vc-table/components/_internal/SlotProxy";

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
  sort: [col: VcColumnProps, event?: MouseEvent];
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

// Column switcher action ref (exposed for anchor positioning)
const columnSwitcherBtnRef = ref<HTMLElement | null>(null);

defineExpose({
  /** The column switcher action element (for dropdown anchor positioning) */
  columnSwitcherEl: computed(() => columnSwitcherBtnRef.value),
});

// Event handlers

const handleSelectAllChange = (value?: boolean) => {
  emit("select-all", value ?? false);
};

const handleSort = (colProps: VcColumnProps, event: Event) => {
  // TableHead emits Event, but header sort clicks are always MouseEvent in practice
  emit("sort", colProps, event as MouseEvent);
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
.vc-col-switcher-trigger {
  position: absolute;
  right: 0;
  top: 50%;
  z-index: 11;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 16px 0 0 16px;

  background: var(--neutrals-200);
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  // Idle: shifted right, ~14px visible — subtle peek
  transform: translateY(-50%) translateX(60%);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.2s ease;

  // Hover: slide fully in
  &:hover,
  &--active {
    transform: translateY(-50%) translateX(0);
    background: var(--primary-50);

    .vc-col-switcher-trigger__chevron {
      opacity: 0;
      pointer-events: none;
    }

    .vc-col-switcher-trigger__action {
      opacity: 1;
      pointer-events: auto;
    }
  }

  // Active state (panel open): stronger primary accent
  &--active {
    background: var(--primary-100);

    .vc-col-switcher-trigger__action {
      color: var(--primary-700);
    }
  }

  // Chevron icon (visible in idle)
  // Left-aligned with padding so it sits in the visible ~14px peek area
  &__chevron {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 3px;
    color: var(--neutrals-500);
    opacity: 1;
    transition: opacity 0.2s ease;
    pointer-events: none; // chevron is decorative, clicks go to container
  }

  // Action icon "+" (visible on hover/active)
  &__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--primary-100);
    color: var(--primary-600);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none; // hidden until hover
  }

  // Keyboard focus: reveal fully like hover
  &:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
    transform: translateY(-50%) translateX(0);

    .vc-col-switcher-trigger__chevron {
      opacity: 0;
    }

    .vc-col-switcher-trigger__action {
      opacity: 1;
      pointer-events: auto;
    }
  }

  // Respect reduced motion preference
  @media (prefers-reduced-motion: reduce) {
    &,
    &__chevron,
    &__action {
      transition-duration: 0.01ms !important;
    }
  }
}
</style>

