<template>
  <div
    class="vc-table-row"
    role="button"
    :class="{
      'vc-table-row--odd': index % 2 === 0,
      'vc-table-row--clickable': hasClickListener,
      'vc-table-row--even': index % 2 === 1,
      'vc-table-row--selected':
        item && typeof item === 'object' && 'id' in item && item.id ? selectedItemId === item.id : false,
      'vc-table-row--selection': selection && selection.length && selection.includes(item as T),
      'vc-table-row__drag-row-bottom': draggedRow === index,
      'vc-table-row__drag-row-top': draggedRow === index,
    }"
    @click="$emit('itemClick', item as T)"
    @mouseleave="$emit('closeActions')"
    @mousedown="reorderableRows && $emit('rowMouseDown', $event)"
    @dragstart="reorderableRows && $emit('rowDragStart', $event)"
    @dragover="reorderableRows && $emit('rowDragOver', $event)"
    @dragleave="reorderableRows && $emit('rowDragLeave', $event)"
    @dragend="reorderableRows && $emit('rowDragEnd', $event)"
    @drop="reorderableRows && $emit('rowDrop', $event)"
    @mouseover="$emit('showActions', index)"
  >
    <div
      v-if="multiselect && typeof item === 'object'"
      class="vc-table-row__checkbox"
      @click.stop
    >
      <div class="vc-table-row__checkbox-content">
        <VcCheckbox
          :model-value="isSelected(item as T)"
          size="m"
          :disabled="disabledSelection.includes(item as T)"
          @update:model-value="$emit('rowCheckbox', item as T)"
        />
      </div>
      <div class="vc-table-row__checkbox-resizer" />
    </div>
    <div
      v-for="cell in filteredCols"
      :id="`${(item && typeof item === 'object' && 'id' in item && item.id) || index}_${cell.id}`"
      :key="`${(item && typeof item === 'object' && 'id' in item && item.id) || index}_${cell.id}`"
      class="vc-table-row__cell"
      :class="[cell.class]"
      :style="{ maxWidth: cell.width, width: cell.width }"
    >
      <div class="vc-table-row__cell-content">
        <slot
          :name="`item_${cell.id}`"
          :item="item"
          :cell="cell"
          :index="index"
        >
          <VcTableCell
            :item="item as TableItem"
            :cell="cell as ITableColumns"
            :index="index"
            :editing="editing"
            @update="$emit('onEditComplete', { event: $event, index: index })"
            @blur="$emit('onCellBlur', $event)"
          />
        </slot>
      </div>
    </div>
    <div
      v-if="enableItemActions && itemActionBuilder && typeof item === 'object' && selectedRowIndex === index"
      class="vc-table-row__actions"
      :class="{
        'vc-table-row__actions--hover': hasClickListener,
        'vc-table-row__actions--selected':
          hasClickListener && selection && selection.length && selection.includes(item as T),
      }"
      @click.stop
    >
      <div class="vc-table-row__actions-content">
        <div
          v-for="(itemAction, i) in itemActions[index]"
          :key="i"
          class="vc-table-row__actions-item"
          @click.stop="itemAction.clickHandler(item as T, index)"
        >
          <VcTooltip
            placement="bottom"
            :offset="{
              mainAxis: 5,
            }"
          >
            <VcIcon
              :icon="itemAction.icon"
              size="m"
            />
            <template #tooltip>
              <div class="vc-table-row__actions-tooltip">
                {{ itemAction.title }}
              </div>
            </template>
          </VcTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { VcCheckbox, VcIcon, VcTooltip } from "../../../../../../";
import VcTableCell from "../../../vc-table-cell/vc-table-cell.vue";
import type { ITableColumns, TableItem, TableColPartial } from "../../../../types";
import type { IActionBuilderResult } from "../../../../../../../../core/types";
import { MaybeRef } from "vue";
defineProps<{
  item: T;
  index: number;
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
  isSelected: (item: T) => boolean;
}>();

defineEmits<{
  (e: "itemClick", item: T): void;
  (e: "closeActions"): void;
  (e: "rowMouseDown", event: MouseEvent): void;
  (e: "rowDragStart", event: DragEvent): void;
  (e: "rowDragOver", event: DragEvent): void;
  (e: "rowDragLeave", event: DragEvent): void;
  (e: "rowDragEnd", event: DragEvent): void;
  (e: "rowDrop", event: DragEvent): void;
  (e: "showActions", index: number): void;
  (e: "rowCheckbox", item: T): void;
  (e: "onEditComplete", args: { event: { field: string; value: string | number }; index: number }): void;
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
}>();
</script>

<style lang="scss">
.vc-table-row {
  @apply tw-flex tw-w-full tw-h-14 tw-min-h-14 tw-relative;

  &--odd {
    @apply tw-bg-[--table-row-bg-odd];
  }

  &--even {
    @apply tw-bg-[--table-row-bg-even];
  }

  &--clickable {
    @apply hover:tw-bg-[--table-row-bg-hover] tw-cursor-pointer tw-border-solid;
  }

  &--selected {
    @apply tw-bg-[--table-row-hover] hover:tw-bg-[--table-row-hover];
  }

  &--selection {
    @apply hover:tw-bg-[--table-row-bg-selected] tw-bg-[--table-row-bg-selected];
  }

  &__checkbox {
    @apply tw-w-[36px] tw-max-w-[36px] tw-min-w-[36px] tw-relative tw-flex-1 tw-flex tw-items-center tw-justify-center;
  }

  &__checkbox-content {
    @apply tw-flex tw-justify-center tw-items-center;
  }

  &__checkbox-resizer {
    @apply tw-w-px tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-bg-[--table-resizer-color];
  }

  &__cell {
    @apply tw-box-border tw-overflow-hidden tw-px-3 tw-flex-1 tw-flex tw-items-center tw-relative;
  }

  &__cell-content {
    @apply tw-truncate tw-w-full tw-text-[color:var(--table-text-color)] tw-text-sm;
  }

  &__actions {
    @apply tw-absolute tw-flex tw-right-0 tw-px-2.5 tw-h-full tw-bg-[--table-actions-bg];

    &--hover {
      @apply hover:tw-bg-[--table-actions-bg-hover];
    }

    &--selected {
      @apply hover:tw-bg-[--table-actions-bg-hover-selected-item];
    }
  }

  &__actions-content {
    @apply tw-flex tw-flex-row tw-items-center tw-text-[color:var(--table-actions-text-color)] tw-font-normal tw-text-base tw-leading-5 tw-gap-2.5;
  }

  &__actions-item {
    @apply tw-text-[color:var(--table-actions-icon-color)] tw-cursor-pointer tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center hover:tw-text-[color:var(--table-actions-icon-color-hover)];
  }

  &__actions-tooltip {
    @apply tw-not-italic tw-font-normal tw-text-base tw-leading-5 tw-text-[--table-actions-tooltip-text];
  }

  &__drag-row-bottom {
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      box-shadow: var(--table-row-drag-shadow);
    }
  }

  &__drag-row-top {
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      box-shadow: var(--table-row-drag-shadow);
    }
  }
}
</style>
