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
import { computed } from "vue";
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

// Check if any columns have specified mobilePosition
const hasMobilePositions = computed(() => props.columns.some((col) => typeof col.mobilePosition === "string"));

// Define constants for positions and their order
const POSITION_ORDER: { [key: string]: number } = {
  status: 0,
  image: 1,
  "top-left": 2,
  "top-right": 3,
  "bottom-left": 4,
  "bottom-right": 5,
};

// Group positions by rows
const TOP_ROW_POSITIONS = ["status", "image", "top-left", "top-right"];
const BOTTOM_ROW_POSITIONS = ["bottom-left", "bottom-right"];

/**
 * Finds special columns (status and image) and distributes other
 * columns by positions. Returns a list of columns in display order.
 * @param columns Columns to distribute
 * @returns Sorted list of columns
 */
const autoDistributeColumns = (columns: ITableColumns[]) => {
  const statusColumns = columns.filter((col) => col.type === "status" || col.type === "status-icon");
  const imageColumns = columns.filter((col) => col.type === "image");
  const otherColumns = columns.filter((col) => !statusColumns.includes(col) && !imageColumns.includes(col));

  // Form the resulting array, starting with special columns
  const result = [...statusColumns, ...imageColumns, ...otherColumns];

  // Return no more than 5 columns for optimal display
  return result.slice(0, 5);
};

/**
 * Distributes columns between first and second rows in mobile view
 * @param columns Columns to distribute
 * @returns Object with arrays of columns for first and second rows
 */
const distributeColumnsToRows = (columns: ITableColumns[]) => {
  // Determine if there is a status column in the first position
  const hasStatus = columns.some((col) => col.type === "status" || col.type === "status-icon");
  const hasImage = columns.some((col) => col.type === "image");

  // Distribute columns considering special types
  if (hasStatus || hasImage) {
    // For tables with statuses and images, allocate more space in first row
    // for main content (usually the most important information)
    return {
      firstRow: columns.slice(0, 3),
      secondRow: columns.slice(3),
    };
  }

  // Standard distribution - evenly
  const midpoint = Math.ceil(Math.min(columns.length, 4) / 2);
  return {
    firstRow: columns.slice(0, midpoint),
    secondRow: columns.slice(midpoint, 4),
  };
};

/**
 * Sorts columns according to their position
 * @param columns Columns to sort
 * @returns Sorted array of columns
 */
const sortColumnsByPosition = (columns: ITableColumns[]) => {
  return [...columns].sort((a, b) => {
    const posA = a.mobilePosition as string;
    const posB = b.mobilePosition as string;

    return (POSITION_ORDER[posA] ?? 999) - (POSITION_ORDER[posB] ?? 999);
  });
};

/**
 * Gets visible columns from the provided set
 * @param columns Source columns
 * @returns Only visible columns
 */
const getVisibleColumns = (columns: ITableColumns[]) => {
  return columns.filter((col) => col.mobileVisible !== false);
};

// Columns for the first row
const firstRowColumns = computed(() => {
  if (hasMobilePositions.value) {
    // Filter columns for the first row and sort them
    const topRowColumns = props.columns.filter(
      (col) =>
        col.mobileVisible !== false && col.mobilePosition && TOP_ROW_POSITIONS.includes(col.mobilePosition as string),
    );

    return sortColumnsByPosition(topRowColumns);
  }

  // If no positions are specified, use automatic distribution
  const visibleColumns = getVisibleColumns(props.columns);
  const autoDistributed = autoDistributeColumns(visibleColumns);
  return distributeColumnsToRows(autoDistributed).firstRow;
});

// Columns for the second row
const secondRowColumns = computed(() => {
  if (hasMobilePositions.value) {
    // Filter columns for the second row and sort them
    const bottomRowColumns = props.columns.filter(
      (col) =>
        col.mobileVisible !== false &&
        col.mobilePosition &&
        BOTTOM_ROW_POSITIONS.includes(col.mobilePosition as string),
    );

    return sortColumnsByPosition(bottomRowColumns);
  }

  // If no positions are specified, use automatic distribution
  const visibleColumns = getVisibleColumns(props.columns);
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
