<template>
  <VcButton
    variant="secondary"
    size="sm"
    icon="fas fa-filter"
    :selected="activeCount > 0"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span class="vc-global-filters-button__label">{{ $t("COMPONENTS.ORGANISMS.VC_TABLE.GLOBAL_FILTERS.BUTTON") }}</span>
    <span v-if="activeCount > 0" class="vc-global-filters-button__badge">
      {{ activeCount }}
    </span>
  </VcButton>
</template>

<script setup lang="ts">
/**
 * GlobalFiltersButton - Button to open global filters panel
 *
 * Shows a filter icon with optional badge indicating active filter count.
 * Uses VcButton with secondary variant; `selected` prop activates highlight.
 */
import { VcButton } from "../../../atoms";

withDefaults(
  defineProps<{
    /** Number of active filters (shown as badge) */
    activeCount?: number;
    /** Whether button is disabled */
    disabled?: boolean;
  }>(),
  {
    activeCount: 0,
    disabled: false,
  }
);

defineEmits<{
  /** Emitted when button is clicked */
  click: [event: Event];
}>();
</script>

<style lang="scss">
.vc-global-filters-button {
  &__label {
    @apply tw-hidden sm:tw-inline;
  }

  &__badge {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-ml-1;
    @apply tw-min-w-5 tw-h-5 tw-px-1.5 tw-rounded-full;
    @apply tw-text-xs tw-font-semibold tw-text-[color:var(--additional-50)];
    background-color: var(--primary-500, #3b82f6);
  }
}
</style>
