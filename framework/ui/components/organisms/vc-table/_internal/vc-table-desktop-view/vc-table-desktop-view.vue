<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div
    class="vc-table-desktop-view"
    :class="{
      'vc-table-desktop-view--empty': !items || !items.length,
      'vc-table-desktop-view--multiselect': multiselect,
    }"
  >
    <VcTableHeader
      v-if="filteredCols.length"
      :items="items"
      :filtered-cols="filteredCols"
      :multiselect="multiselect"
      :header-checkbox="headerCheckbox"
      :is-header-hover="isHeaderHover"
      :expanded="expanded"
      :editing="editing"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      :resizable-columns="resizableColumns"
      :internal-columns-sorted="internalColumnsSorted"
      :state-key="stateKey"
      :internal-columns="internalColumns"
      :reorderable-columns="reorderableColumns"
      @header-mouse-over="handleHeaderMouseOver"
      @column-switcher="handleColumnSwitcher"
      @header-click="handleHeaderClick"
      @update:header-checkbox="$emit('update:headerCheckbox', $event)"
      @column-reorder="$emit('columnReorder')"
      @column-resize="$emit('columnResize')"
      @toggle-column="toggleColumn"
    />

    <VcTableSelectAllHeader
      :select-all="selectAll"
      :show-selection-choice="showSelectionChoice"
      :all-selected="allSelected"
      @select-all="handleSelectAll"
    />

    <VcTableBody
      :items="items"
      :filtered-cols="filteredCols"
      :multiselect="multiselect"
      :selected-item-id="selectedItemId"
      :selection="selection"
      :disabled-selection="disabledSelection"
      :reorderable-rows="reorderableRows"
      :dragged-row="draggedRow"
      :has-click-listener="hasClickListener"
      :editing="editing"
      :enable-item-actions="enableItemActions"
      :item-action-builder="itemActionBuilder"
      :item-actions="itemActions"
      :selected-row-index="selectedRowIndex"
      :columns-init="columnsInit"
      :search-value="searchValue"
      :active-filter-count="activeFilterCount"
      :notfound="notfound"
      :empty="empty"
      :is-selected="isSelected"
      @item-click="$emit('itemClick', $event)"
      @close-actions="closeActions"
      @row-mouse-down="onRowMouseDown"
      @row-drag-start="onRowDragStart"
      @row-drag-over="onRowDragOver"
      @row-drag-leave="onRowDragLeave"
      @row-drag-end="onRowDragEnd"
      @row-drop="onRowDrop"
      @show-actions="showActions"
      @row-checkbox="rowCheckbox"
      @on-edit-complete="$emit('onEditComplete', $event)"
      @on-cell-blur="$emit('onCellBlur', $event)"
    >
      <template
        v-for="(slot, i) in slotName"
        :key="i"
        #[slot]="slotProps"
      >
        <slot
          :name="slot"
          v-bind="slotProps"
        />
      </template>
    </VcTableBody>
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { toRefs, MaybeRef, useSlots } from "vue";
import VcTableHeader from "./_internal/vc-table-header/vc-table-header.vue";
import VcTableSelectAllHeader from "./_internal/vc-table-select-all-header/vc-table-select-all-header.vue";
import VcTableBody from "./_internal/vc-table-body/vc-table-body.vue";
import type { ITableColumns, TableItem, TableColPartial, StatusImage } from "../../types";
import type { IActionBuilderResult } from "../../../../../../core/types";
import { useTableRowReorder } from "../../composables/useTableRowReorder";
import type { TableSlots } from "../../vc-table.vue";

const props = defineProps<{
  items: T[];
  filteredCols: TableColPartial[];
  multiselect?: boolean;
  headerCheckbox: boolean;
  isHeaderHover: boolean;
  expanded?: boolean;
  editing?: boolean;
  sortField?: string;
  sortDirection?: string;
  resizableColumns?: boolean;
  internalColumnsSorted: TableColPartial[];
  stateKey: string;
  selectAll?: boolean;
  showSelectionChoice?: boolean;
  allSelected?: boolean;
  selection: T[];
  disabledSelection: T[];
  columnsInit: boolean;
  selectedItemId?: MaybeRef<string>;
  reorderableRows?: boolean;
  reorderableColumns?: boolean;
  enableItemActions?: boolean;
  itemActionBuilder?: (item: T) => IActionBuilderResult<T>[] | undefined;
  itemActions: IActionBuilderResult<T>[][];
  selectedRowIndex?: number;
  hasClickListener?: boolean;
  searchValue?: string;
  activeFilterCount?: number;
  notfound?: StatusImage;
  empty?: StatusImage;
  isSelected: (item: T) => boolean;
  rowCheckbox: (item: T) => void;
  internalColumns: TableColPartial[];
}>();

const emit = defineEmits<{
  (e: "itemClick", item: T): void;
  (e: "onEditComplete", args: { event: { field: string; value: string | number }; index: number }): void;
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
  (e: "headerMouseOver", value: boolean): void;
  (e: "columnSwitcher", value: boolean): void;
  (e: "headerClick", item: ITableColumns): void;
  (e: "selectAll"): void;
  (e: "update:headerCheckbox", value: boolean): void;
  (e: "columnReorder"): void;
  (e: "columnResize"): void;
  (e: "row:reorder", args: { dragIndex: number; dropIndex: number; value: T[] }): void;
  (e: "showActions", index: number): void;
  (e: "closeActions"): void;
  (e: "toggleColumn", item: ITableColumns): void;
}>();

defineSlots<TableSlots<T>>();

const { items } = toRefs(props);
const slots = useSlots();

const slotName = Object.keys(slots) as unknown;

const { draggedRow, onRowMouseDown, onRowDragStart, onRowDragOver, onRowDragLeave, onRowDragEnd, onRowDrop } =
  useTableRowReorder<T>(items, (args) => emit("row:reorder", args));

function handleHeaderMouseOver(state: boolean) {
  emit("headerMouseOver", state);
}

function handleColumnSwitcher(state: boolean) {
  emit("columnSwitcher", state);
}

function handleHeaderClick(item: TableColPartial) {
  const cleanCol = { ...item };
  delete cleanCol.predefined;
  emit("headerClick", cleanCol as ITableColumns);
}

function handleSelectAll() {
  emit("selectAll");
}

function showActions(index: number) {
  emit("showActions", index);
}

function closeActions() {
  emit("closeActions");
}

function toggleColumn(item: ITableColumns) {
  emit("toggleColumn", item);
}

defineExpose({
  onRowMouseDown,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDragEnd,
  onRowDrop,
});
</script>

<style lang="scss">
.vc-table-desktop-view {
  @apply tw-relative tw-box-border tw-w-full tw-h-full tw-flex tw-flex-col;

  &--empty {
    @apply tw-overflow-auto;
  }

  &--multiselect {
    @apply tw-overflow-auto;
  }
}
</style>
