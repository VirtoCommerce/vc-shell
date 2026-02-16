<template>
  <div role="table" class="vc-table-composition" :class="variant && `vc-table-composition--${variant}`">
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any> = Record<string, any>">
import { provide, reactive, toRefs, computed, type ComputedRef } from "vue";

interface TableContext<T> {
  selectedRowIndex: ComputedRef<number | undefined>;
  setSelectedRowIndex: (index: number | undefined) => void;
  variant: ComputedRef<string | undefined>;
}

const props = withDefaults(
  defineProps<{
    /**
     * Visual variant of the table
     */
    variant?: "default" | "striped" | "bordered";
  }>(),
  {
    variant: "default",
  },
);

// Internal state for row actions
const state = reactive({
  selectedRowIndex: undefined as number | undefined,
});

const selectedRowIndex = computed(() => state.selectedRowIndex);

const setSelectedRowIndex = (index: number | undefined) => {
  state.selectedRowIndex = index;
};

// Provide context to child components
const context: TableContext<T> = {
  selectedRowIndex,
  setSelectedRowIndex,
  variant: computed(() => props.variant),
};

provide("tableContext", context);
</script>

<style lang="scss">
.vc-table-composition {
  // Key styles for layout:
  // - h-full: inherit parent height constraint
  // - flex-col: stack header, body, footer vertically
  // - overflow: hidden: columns shrink to fit; horizontal scroll is not used
  // - min-h-0: critical for nested flex containers to enable scrolling
  @apply tw-relative tw-box-border tw-w-full tw-h-full tw-flex tw-flex-col tw-overflow-hidden;
  min-height: 0;

  // CSS Variables from original vc-table
  --table-border-color: var(--neutrals-200);
  --table-header-border-color: var(--neutrals-200);
  --table-header-border:
    inset 0px 1px 0px var(--table-header-border-color), inset 0px -1px 0px var(--table-header-border-color);
  --table-resizer-color: var(--neutrals-200);
  --table-reorder-color: var(--primary-400);

  --table-header-bg: var(--primary-50);
  --table-row-bg-odd: var(--additional-50);
  --table-row-bg-even: var(--neutrals-50);
  --table-row-bg-hover: var(--primary-100);
  --table-row-bg-selected: var(--primary-100);

  --table-actions-bg: var(--primary-100);
  --table-actions-icon-color: var(--primary-500);
  --table-actions-icon-color-hover: var(--primary-600);
  --table-actions-color-danger: var(--danger-500);
  --table-actions-color-success: var(--success-500);

  --table-header-text-color: var(--secondary-950);
  --table-text-color: var(--neutrals-950);
  --table-sort-icon-color: var(--neutrals-400);

  --table-footer-bg: var(--neutrals-50);
  --table-footer-border-color: var(--neutrals-200);

  --table-mobile-border-color: var(--secondary-200);

  &--striped {
    .vc-table-composition__row:nth-child(even) {
      background-color: var(--table-row-bg-even);
    }
  }

  &--bordered {
    .vc-table-composition__row {
      border-bottom: 1px solid var(--table-border-color);
    }
  }
}
</style>
