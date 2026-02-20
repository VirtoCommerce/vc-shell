<template>
  <div class="vc-table-composition__empty-state">
    <VcIcon v-if="icon" :icon="icon" size="xxl" class="vc-table-composition__empty-icon" />
    <div class="vc-table-composition__empty-content">
      <slot>
        <div class="vc-table-composition__empty-title">
          {{ title || "No data" }}
        </div>
        <div v-if="description" class="vc-table-composition__empty-description">
          {{ description }}
        </div>
      </slot>
    </div>
    <div v-if="$slots.action" class="vc-table-composition__empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcIcon } from "@ui/components/atoms";

defineProps<{
  /**
   * Icon to display
   */
  icon?: string;
  /**
   * Title text
   */
  title?: string;
  /**
   * Description text
   */
  description?: string;
}>();
</script>

<style lang="scss">
.vc-table-composition__empty-state {
  @apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-py-12 tw-px-4 tw-flex-1;
}

.vc-table-composition__empty-icon {
  @apply tw-text-neutrals-300;
}

.vc-table-composition__empty-content {
  @apply tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-center;
}

.vc-table-composition__empty-title {
  @apply tw-text-base tw-font-medium tw-text-neutrals-700;
}

.vc-table-composition__empty-description {
  @apply tw-text-sm tw-text-neutrals-500 tw-max-w-md;
}

.vc-table-composition__empty-action {
  @apply tw-mt-2;
}
</style>
