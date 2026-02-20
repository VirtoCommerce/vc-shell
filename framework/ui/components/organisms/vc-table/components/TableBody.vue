<template>
  <div role="rowgroup" class="vc-table-composition__body" :data-items-count="items?.length">
    <template v-if="!loading && hasContent">
      <slot :items="items" />
    </template>
    <div v-else-if="!loading && !hasContent" key="__empty__" class="vc-table-composition__body-state">
      <slot name="empty">
        <div class="vc-table-composition__empty">
          <slot name="empty-content">No data available</slot>
        </div>
      </slot>
    </div>
    <div v-else key="__loading__" class="vc-table-composition__body-state">
      <slot name="loading">
        <div class="vc-table-composition__loading">
          <div class="vc-table-composition__loading-spinner">Loading...</div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = defineProps<{
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Items array to check if empty
   */
  items?: unknown[];
}>();

const slots = useSlots();

const hasContent = computed(() => {
  if (props.items !== undefined) {
    return props.items.length > 0;
  }
  return !!slots.default;
});
</script>

<style lang="scss">
.vc-table-composition__body {
  @apply tw-flex tw-flex-col tw-overflow-auto;
  // flex: 1 1 0 ensures body takes remaining space and enables scrolling
  // min-height: 0 is critical for flex children to allow shrinking below content size
  flex: 1 1 0;
  min-height: 0;
}

.vc-table-composition__body-state {
  @apply tw-flex tw-flex-col tw-flex-1 tw-items-center tw-justify-center;
}

.vc-table-composition__empty,
.vc-table-composition__loading {
  @apply tw-flex tw-items-center tw-justify-center tw-py-8 tw-text-neutrals-400;
}

.vc-table-composition__loading-spinner {
  @apply tw-text-sm;
}

/* FLIP move animation for row reorder */
.vc-table-row-swap-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* Disable transitions on enter/leave so only moves animate */
.vc-table-row-swap-enter-active,
.vc-table-row-swap-leave-active {
  transition: none !important;
}
</style>
