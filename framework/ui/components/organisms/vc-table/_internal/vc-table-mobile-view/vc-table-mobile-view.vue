<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="vc-table-mobile-view">
    <div
      v-if="items && items.length"
      class="vc-table-mobile-view__items"
      @contextmenu.prevent
    >
      <VcTableMobileItem
        v-for="(item, i) in items"
        :key="i"
        :index="i"
        :items="items"
        :action-builder="itemActionBuilder"
        :disabled-selection="disabledSelection"
        :selection="selection"
        :is-selected="isSelected(item)"
        @contextmenu.prevent
        @click="$emit('itemClick', item)"
        @select="multiselect ? rowCheckbox(item) : undefined"
      >
        <slot
          name="mobile-item"
          :item="item"
        >
          <div class="vc-table-mobile-view__item-renderer">
            <div class="vc-table-mobile-view__content">
              <!-- Status column -->
              <template
                v-for="column in firstRowColumns"
                :key="column.id"
              >
                <div
                  v-if="column.type === 'status-icon' || column.type === 'status'"
                  :class="[
                    'vc-table-mobile-view__cell',
                    {
                      'vc-table-mobile-view__cell--status': column.type === 'status',
                      'vc-table-mobile-view__cell--status-icon': column.type === 'status-icon',
                    },
                    column.class,
                  ]"
                >
                  <slot
                    :name="`item_${column.id}`"
                    :item="item"
                    :cell="column"
                    :index="i"
                  >
                    <VcTableCell
                      v-if="typeof item === 'object'"
                      :key="`mobile-view-cell-${i}-${column.id}`"
                      :cell="column"
                      :item="item"
                      :index="i"
                      @update="$emit('onEditComplete', { event: $event, index: i })"
                      @blur="$emit('onCellBlur', $event)"
                    />
                  </slot>
                </div>
              </template>

              <!-- Image column -->
              <template
                v-for="column in firstRowColumns"
                :key="column.id"
              >
                <div
                  v-if="column.type === 'image'"
                  :class="['vc-table-mobile-view__cell', 'vc-table-mobile-view__cell--image', column.class]"
                >
                  <slot
                    :name="`item_${column.id}`"
                    :item="item"
                    :cell="column"
                    :index="i"
                  >
                    <VcTableCell
                      v-if="typeof item === 'object'"
                      :key="`mobile-view-cell-${i}-${column.id}`"
                      :cell="column"
                      :item="item"
                      :index="i"
                      @update="$emit('onEditComplete', { event: $event, index: i })"
                      @blur="$emit('onCellBlur', $event)"
                    />
                  </slot>
                </div>
              </template>

              <!-- Main content container -->
              <div class="vc-table-mobile-view__rows">
                <!-- First row -->
                <div class="vc-table-mobile-view__row">
                  <template
                    v-for="column in firstRowColumns"
                    :key="column.id"
                  >
                    <div
                      v-if="column.type !== 'status-icon' && column.type !== 'status' && column.type !== 'image'"
                      :class="[
                        'vc-table-mobile-view__cell',
                        `vc-table-mobile-view__cell--${column.type || 'default'}`,
                        column.class,
                      ]"
                    >
                      <slot
                        :name="`item_${column.id}`"
                        :item="item"
                        :cell="column"
                        :index="i"
                      >
                        <VcTableCell
                          v-if="typeof item === 'object'"
                          :key="`mobile-view-cell-${i}-${column.id}`"
                          :cell="column"
                          :item="item"
                          :index="i"
                          @update="$emit('onEditComplete', { event: $event, index: i })"
                          @blur="$emit('onCellBlur', $event)"
                        />
                      </slot>
                    </div>
                  </template>
                </div>
                <!-- Second row -->
                <div class="vc-table-mobile-view__row">
                  <template
                    v-for="column in secondRowColumns"
                    :key="column.id"
                  >
                    <div
                      :class="[
                        'vc-table-mobile-view__cell',
                        `vc-table-mobile-view__cell--${column.type || 'default'}`,
                        column.class,
                      ]"
                    >
                      <slot
                        :name="`item_${column.id}`"
                        :item="item"
                        :cell="column"
                        :index="i"
                      >
                        <VcTableCell
                          v-if="typeof item === 'object'"
                          :key="`mobile-view-cell-${i}-${column.id}`"
                          :cell="column"
                          :item="item"
                          :index="i"
                          @update="$emit('onEditComplete', { event: $event, index: i })"
                          @blur="$emit('onCellBlur', $event)"
                        />
                      </slot>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </slot>
      </VcTableMobileItem>
    </div>
    <div
      v-else
      class="vc-table-mobile-view__empty"
    >
      <VcTableEmpty
        :items="items"
        :columns-init="columnsInit"
        :search-value="searchValue"
        :active-filter-count="activeFilterCount || 0"
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
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { toValue, computed } from "vue";
import { VcLabel } from "../../../../atoms";
import VcTableCell from "../vc-table-cell/vc-table-cell.vue";
import VcTableEmpty from "../vc-table-empty/vc-table-empty.vue";
import VcTableMobileItem from "../vc-table-mobile-item/vc-table-mobile-item.vue";
import type { TableItem, StatusImage } from "../../vc-table.vue";
import { IActionBuilderResult, ITableColumns } from "../../../../../../core/types";
import { provideTableSwipe } from "../../composables/useTableSwipe";

const props = defineProps<{
  items: T[];
  columns: ITableColumns[];
  itemActionBuilder?: (item: T) => IActionBuilderResult<T>[] | undefined;
  multiselect?: boolean;
  disabledSelection: T[];
  selection: T[];
  isSelected: (item: T) => boolean;
  rowCheckbox: (item: T) => void;
  editing?: boolean;
  columnsInit: boolean;
  searchValue?: string;
  activeFilterCount?: number;
  notfound?: StatusImage;
  empty?: StatusImage;
}>();

const emit = defineEmits<{
  (e: "itemClick", item: T): void;
  (e: "onEditComplete", args: { event: { field: string; value: string | number }; index: number }): void;
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
}>();

const hasMobilePositions = computed(() => props.columns.some((col) => col.mobilePosition?.row !== undefined));

const autoDistributeColumns = (columns: ITableColumns[]) => {
  const result: ITableColumns[] = [];

  const statusColumn = columns.find((col) => col.type === "status" || col.type === "status-icon");
  if (statusColumn) {
    result.push(statusColumn);
  }

  const remainingColumns = columns.filter((col) => !result.includes(col));
  const columnsToAdd = 4;
  result.push(...remainingColumns.slice(0, columnsToAdd));

  return result;
};

const distributeColumnsToRows = (columns: ITableColumns[]) => {
  const hasStatus = columns[0]?.type === "status" || columns[0]?.type === "status-icon";

  if (hasStatus) {
    return {
      firstRow: [columns[0], columns[1], columns[2]],
      secondRow: columns.slice(3),
    };
  }

  return {
    firstRow: columns.slice(0, 2),
    secondRow: columns.slice(2, 4),
  };
};

const firstRowColumns = computed(() => {
  if (hasMobilePositions.value) {
    return props.columns
      .filter((col) => {
        return col.mobileVisible !== false && col.mobilePosition?.row === 1;
      })
      .sort((a, b) => {
        if (a.mobilePosition?.order !== undefined && b.mobilePosition?.order !== undefined) {
          return a.mobilePosition.order - b.mobilePosition.order;
        }
        if (a.mobilePosition?.order !== undefined) return -1;
        if (b.mobilePosition?.order !== undefined) return 1;
        return 0;
      });
  }

  const visibleColumns = props.columns.filter((col) => col.mobileVisible !== false);
  const autoDistributed = autoDistributeColumns(visibleColumns);
  return distributeColumnsToRows(autoDistributed).firstRow;
});

const secondRowColumns = computed(() => {
  if (hasMobilePositions.value) {
    return props.columns
      .filter((col) => {
        return col.mobileVisible !== false && col.mobilePosition?.row === 2;
      })
      .sort((a, b) => {
        if (a.mobilePosition?.order !== undefined && b.mobilePosition?.order !== undefined) {
          return a.mobilePosition.order - b.mobilePosition.order;
        }
        if (a.mobilePosition?.order !== undefined) return -1;
        if (b.mobilePosition?.order !== undefined) return 1;
        return 0;
      });
  }

  const visibleColumns = props.columns.filter((col) => col.mobileVisible !== false);
  const autoDistributed = autoDistributeColumns(visibleColumns);
  return distributeColumnsToRows(autoDistributed).secondRow;
});

provideTableSwipe();
</script>

<style lang="scss">
.vc-table-mobile-view {
  @apply tw-grow tw-basis-0 tw-relative tw-h-full;

  &__items {
    @apply tw-flex-grow tw-flex tw-flex-col tw-h-max [width:-webkit-fill-available] [width:-moz-available];
  }

  &__empty {
    @apply tw-overflow-auto tw-flex tw-flex-col tw-h-full tw-flex-grow;
  }

  &__item-renderer {
    @apply tw-py-2 tw-px-[28px];
  }

  &__items > *:nth-child(odd) .vc-table-mobile__item {
    @apply tw-bg-[color:var(--additional-50)];
  }

  &__items > *:nth-child(even) .vc-table-mobile__item {
    @apply tw-bg-[color:var(--neutrals-50)];
  }

  &__content {
    @apply tw-flex tw-flex-row tw-items-start;
  }

  &__rows {
    @apply tw-flex tw-flex-col tw-flex-grow tw-w-full;
  }

  &__row {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-3;

    &:first-child {
      @apply tw-mb-2;
    }
  }

  &__cell {
    @apply tw-flex tw-items-center tw-min-w-0 tw-max-w-[50%] tw-truncate;

    &--image {
      @apply tw-min-w-14 tw-min-h-14 tw-overflow-hidden tw-mr-4;
    }

    // Status and icon cells
    &--status,
    &--status-icon {
      @apply tw-absolute tw-left-0 tw-w-6 tw-h-6 tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center;
    }

    &--status-icon {
      @apply tw-top-10;
    }

    &--title,
    &--code {
      @apply tw-flex-grow tw-truncate tw-mr-4;
    }

    &--title {
      @apply tw-text-lg tw-font-medium;
    }

    &--code {
      @apply tw-text-base tw-font-normal tw-text-[--table-cell-text-color];
    }

    &--date,
    &--date-ago,
    &--money,
    &--number {
      @apply tw-flex-shrink-0 tw-text-right;
    }

    &--date,
    &--date-ago {
      @apply tw-text-sm tw-text-[--table-cell-text-color];
    }

    &--money,
    &--number {
      @apply tw-text-base tw-font-medium;
    }
  }
}
</style>
