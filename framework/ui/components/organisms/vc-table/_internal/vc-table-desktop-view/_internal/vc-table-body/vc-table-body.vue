<template>
  <div
    v-if="items && items.length && !columnsInit"
    ref="tableBody"
    class="vc-table-body"
  >
    <VcTableRow
      v-for="(item, itemIndex) in items"
      :key="(typeof item === 'object' && 'id' in item && item.id) || itemIndex"
      :item="item"
      :index="itemIndex"
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
      :is-selected="isSelected"
      @item-click="$emit('itemClick', $event)"
      @close-actions="$emit('closeActions')"
      @row-mouse-down="$emit('rowMouseDown', $event)"
      @row-drag-start="$emit('rowDragStart', $event, item)"
      @row-drag-over="$emit('rowDragOver', $event, item)"
      @row-drag-leave="$emit('rowDragLeave', $event)"
      @row-drag-end="$emit('rowDragEnd', $event)"
      @row-drop="$emit('rowDrop', $event)"
      @show-actions="$emit('showActions', $event)"
      @row-checkbox="$emit('rowCheckbox', $event)"
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
    </VcTableRow>
  </div>
  <div
    v-else
    class="vc-table-body__empty"
  >
    <VcTableEmpty
      :items="items"
      :columns-init="columnsInit"
      :search-value="searchValue"
      :active-filter-count="activeFilterCount"
      :notfound="notfound"
      :empty="empty"
    >
      <template #notfound>
        <slot name="notfound" />
      </template>
      <template #empty>
        <slot name="empty" />
      </template>
    </VcTableEmpty>
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import VcTableRow from "../vc-table-row/vc-table-row.vue";
import VcTableEmpty from "../../../vc-table-empty/vc-table-empty.vue";
import type { IActionBuilderResult } from "../../../../../../../../core/types";
import type { TableSlots, TableItem, TableColPartial, StatusImage } from "../../../../vc-table.vue";
import { MaybeRef, useSlots } from "vue";

defineProps<{
  items: T[];
  filteredCols: TableColPartial[];
  multiselect?: boolean;
  selectedItemId?: MaybeRef<string>;
  selection: T[];
  disabledSelection: T[];
  reorderableRows?: boolean;
  draggedRow?: number;
  hasClickListener?: boolean;
  editing?: boolean;
  enableItemActions?: boolean;
  itemActionBuilder?: (item: T) => IActionBuilderResult[] | undefined;
  itemActions: IActionBuilderResult[][];
  selectedRowIndex?: number;
  columnsInit: boolean;
  searchValue?: string;
  activeFilterCount?: number;
  notfound?: StatusImage;
  empty?: StatusImage;
  isSelected: (item: T) => boolean;
}>();

defineEmits<{
  (e: "itemClick", item: T): void;
  (e: "closeActions"): void;
  (e: "rowMouseDown", event: MouseEvent): void;
  (e: "rowDragStart", event: DragEvent, item: T): void;
  (e: "rowDragOver", event: DragEvent, item: T): void;
  (e: "rowDragLeave", event: DragEvent): void;
  (e: "rowDragEnd", event: DragEvent): void;
  (e: "rowDrop", event: DragEvent): void;
  (e: "showActions", index: number): void;
  (e: "rowCheckbox", item: T): void;
  (e: "onEditComplete", args: { event: { field: string; value: string | number }; index: number }): void;
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
}>();

defineSlots<TableSlots<T>>();

const slots = useSlots();

const slotName = Object.keys(slots) as unknown;
</script>

<style lang="scss">
.vc-table-body {
  @apply tw-flex tw-flex-col tw-overflow-auto;

  &__empty {
    @apply tw-overflow-auto tw-flex tw-flex-col tw-flex-auto;
  }
}
</style>
