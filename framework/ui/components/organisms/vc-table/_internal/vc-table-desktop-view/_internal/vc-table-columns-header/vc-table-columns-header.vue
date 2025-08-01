<template>
  <div
    ref="headerRef"
    class="vc-table-columns-header"
    @mouseenter="$emit('headerMouseOver', true)"
    @mouseleave="$emit('headerMouseOver', false)"
  >
    <div class="vc-table-columns-header__row">
      <div
        v-if="multiselect && items && items.length"
        class="vc-table-columns-header__checkbox"
      >
        <div class="vc-table-columns-header__checkbox-content">
          <VcCheckbox
            :model-value="headerCheckbox"
            size="s"
            :indeterminate="selection && selection.length > 0 && selection.length !== items.length"
            @update:model-value="$emit('update:headerCheckbox', $event)"
            @click.stop
          />
        </div>
        <div class="vc-table-columns-header__checkbox-resizer" />
      </div>
      <div
        v-for="(item, index) in filteredCols"
        :id="item.id"
        :key="item.id"
        class="vc-table-columns-header__cell"
        :class="[
          {
            'vc-table-columns-header__cell--sortable': item.sortable,
            'vc-table-columns-header__cell--last': index === filteredCols.length - 1,
            'vc-table-columns-header__cell--fixed-width': !!item.width,
          },
          item.align ? tableAlignment[item.align] : '',
        ]"
        :style="
          item.width
            ? { maxWidth: item.width, width: item.width, flex: '0 1 auto', minWidth: '60px' }
            : { flex: '1 1 0', minWidth: '60px' }
        "
        @mousedown="reorderableColumns && onColumnHeaderMouseDown($event)"
        @dragstart="reorderableColumns && onColumnHeaderDragStart($event, item)"
        @dragover="reorderableColumns && onColumnHeaderDragOver($event)"
        @dragleave="reorderableColumns && onColumnHeaderDragLeave($event)"
        @drop="reorderableColumns && onColumnHeaderDrop($event, item)"
        @click="!columnResizing && !isResizing && $emit('headerClick', item)"
      >
        <div class="vc-table-columns-header__cell-content">
          <div class="vc-table-columns-header__cell-title">
            <span
              v-if="editing && item.rules?.required"
              class="vc-table-columns-header__cell-required"
              >*</span
            >
            <slot :name="`header_${item.id}`">{{ item.title }}</slot>
          </div>
          <div
            v-if="sortField === item.id"
            class="vc-table-columns-header__cell-sort-icon"
          >
            <VcIcon
              size="xs"
              :icon="`material-keyboard_arrow_${sortDirection === 'DESC' ? 'down' : 'up'}`"
            />
          </div>
          <div
            v-else
            class="vc-table-columns-header__cell-sort-icons"
          >
            <VcIcon
              size="xs"
              icon="material-keyboard_arrow_up"
            />
            <VcIcon
              size="xs"
              icon="material-keyboard_arrow_down"
            />
          </div>
        </div>
        <div
          v-if="resizableColumns"
          class="vc-table-columns-header__cell-resizer"
          :class="{
            'vc-table-columns-header__cell-resizer--cursor': resizableColumns,
            'vc-table-columns-header__cell-resizer--last': index === filteredCols.length - 1,
          }"
          @mousedown.stop.prevent="handleResizerMouseDown($event, item)"
          @click.stop.prevent
        />
      </div>

      <div
        v-if="isHeaderHover && expanded"
        class="vc-table-columns-header__column-switcher"
      >
        <VcTableColumnSwitcher
          :items="internalColumnsSorted"
          :state-key="stateKey"
          @change="$emit('toggleColumn', $event)"
          @on-active="$emit('columnSwitcher', $event)"
        />
      </div>
    </div>

    <div
      ref="resizer"
      class="vc-table-columns-header__resizer"
    />
    <div
      ref="reorderRef"
      class="vc-table-columns-header__reorder-ref"
    />
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { toRefs, ref } from "vue";
import { VcCheckbox, VcIcon } from "../../../../../..";
import VcTableColumnSwitcher from "../../../vc-table-column-switcher/vc-table-column-switcher.vue";
import type { TableItem, TableColPartial } from "../../../../types";
import { useTableColumnReorder } from "../../../../composables/useTableColumnReorder";
import { useTableColumnResize } from "../../../../composables/useTableColumnResize";
import { ITableColumns } from "../../../../../../../../core/types";

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
  reorderableColumns?: boolean;
  internalColumnsSorted: TableColPartial[];
  stateKey: string;
  internalColumns: TableColPartial[];
  selection?: T[];
}>();

const emit = defineEmits<{
  (e: "headerMouseOver", value: boolean): void;
  (e: "columnSwitcher", value: boolean): void;
  (e: "headerClick", item: TableColPartial): void;
  (e: "update:headerCheckbox", value: boolean): void;
  (e: "columnReorder"): void;
  (e: "columnResize"): void;
  (e: "toggleColumn", item: ITableColumns): void;
}>();

const tableAlignment = {
  start: "tw-justify-start",
  end: "tw-justify-end",
  center: "tw-justify-center",
  between: "tw-justify-between",
  around: "tw-justify-around",
  evenly: "tw-justify-evenly",
};

const { internalColumns } = toRefs(props);

const headerRef = ref<HTMLElement>();

const {
  reorderRef,
  onColumnHeaderMouseDown,
  onColumnHeaderDragStart,
  onColumnHeaderDragOver,
  onColumnHeaderDragLeave,
  onColumnHeaderDrop,
} = useTableColumnReorder<T>(internalColumns, () => emit("columnReorder"), headerRef);

const { resizer, handleMouseDown, columnResizing } = useTableColumnResize(
  internalColumns,
  () => emit("columnResize"),
  headerRef,
);

// Additional flag to prevent clicks during resize
const isResizing = ref(false);
let resizeTimeout: NodeJS.Timeout;

const handleResizerMouseDown = (e: MouseEvent, item: TableColPartial) => {
  e.preventDefault();
  e.stopPropagation();

  isResizing.value = true;

  // Disable pointer events on header cells during resize
  const headerCells = headerRef.value?.querySelectorAll(".vc-table-columns-header__cell");
  headerCells?.forEach((cell) => {
    (cell as HTMLElement).style.pointerEvents = "none";
  });

  // Re-enable pointer events on resizers
  const resizers = headerRef.value?.querySelectorAll(".vc-table-columns-header__cell-resizer");
  resizers?.forEach((resizer) => {
    (resizer as HTMLElement).style.pointerEvents = "auto";
  });

  handleMouseDown(e, item);

  // Re-enable pointer events after mouse up
  const restorePointerEvents = () => {
    headerCells?.forEach((cell) => {
      (cell as HTMLElement).style.pointerEvents = "";
    });
    isResizing.value = false;
    document.removeEventListener("mouseup", restorePointerEvents);
  };

  document.addEventListener("mouseup", restorePointerEvents);
};
</script>

<style lang="scss">
:root {
  --table-header-height: 60px;
  --table-header-border-color: var(--neutrals-200);
}

.vc-table-columns-header {
  @apply tw-border-y tw-border-[color:var(--table-header-border-color)] tw-border-solid tw-relative;
  &__row {
    @apply tw-flex tw-flex-row [box-shadow:var(--table-header-border)] tw-bg-[--table-header-bg] tw-overflow-x-hidden;
  }

  &__checkbox {
    @apply tw-w-[36px] tw-max-w-[36px] tw-min-w-[36px] tw-relative tw-flex tw-items-center tw-justify-center tw-bg-[--table-header-bg] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1];
  }

  &__checkbox-content {
    @apply tw-flex tw-justify-center tw-items-center;
  }

  &__checkbox-resizer {
    @apply tw-w-px tw-bg-[--table-resizer-color] tw-h-full tw-absolute tw-right-0 tw-flex tw-justify-end;
  }

  &__cell {
    @apply tw-flex tw-items-center tw-h-[var(--table-header-height)] tw-bg-[--table-header-bg] tw-box-border tw-sticky tw-top-0 tw-select-none tw-z-[1] tw-relative tw-flex-1;
    overflow: hidden;

    &--last {
      overflow: visible;
    }

    &--fixed-width {
      @apply tw-flex-1;
    }

    &--sortable {
      @apply tw-cursor-pointer;

      &:hover {
        .vc-table-columns-header__cell-sort-icons {
          @apply tw-visible;
        }
      }
    }
  }

  &__cell-content {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3 tw-font-semibold tw-text-sm tw-text-[color:var(--table-header-text-color)] tw-leading-5;
  }

  &__cell-title {
    @apply tw-truncate;
  }

  &__cell-required {
    @apply tw-text-[color:var(--label-required-color)] tw-mr-1;
  }

  &__cell-sort-icon {
    @apply tw-ml-1 tw-text-[color:var(--table-sort-icon-color)];
  }

  &__cell-sort-icons {
    @apply tw-flex tw-flex-col tw-ml-1 tw-invisible tw-text-[color:var(--table-sort-icon-color)];
  }

  &__cell-resizer {
    @apply tw-w-1 tw-border-r tw-border-[--table-resizer-color] tw-border-solid tw-h-full tw-absolute tw-right-0 tw-flex tw-justify-end tw-z-10;

    &::before {
      content: "";
      @apply tw-absolute tw-right-0 tw-w-[9px] tw-h-full tw-cursor-col-resize tw-z-10;
    }

    &--cursor {
      @apply tw-cursor-col-resize;
    }

    &--last {
      @apply tw-z-[100];
    }
  }

  &__column-switcher {
    @apply tw-absolute tw-z-10 tw-right-0 tw-top-[11px] tw-flex tw-items-center tw-pointer-events-none;

    > * {
      @apply tw-pointer-events-auto;
    }
  }

  &__resizer {
    @apply tw-w-px tw-absolute tw-z-10 tw-hidden tw-h-full tw-bg-[--table-resizer-color] tw-cursor-col-resize;
    max-width: 100%;
  }

  &__reorder-ref {
    @apply tw-w-0.5 tw-bg-[--table-reorder-color] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-20 tw-hidden;
  }
}
</style>
