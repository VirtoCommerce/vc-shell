<template>
  <div class="assets-folder-state">
    <VcIcon
      v-if="state.icon"
      :icon="state.icon"
      size="xxl"
      class="assets-folder-state__icon"
    />
    <div class="assets-folder-state__title">{{ state.title }}</div>
    <div
      v-if="state.description"
      class="assets-folder-state__description"
    >
      {{ state.description }}
    </div>
    <VcButton
      v-if="state.actionLabel"
      class="assets-folder-state__action"
      variant="outline"
      @click="state.actionHandler?.()"
    >
      {{ state.actionLabel }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import type { TableStateConfig } from "@ui/components/organisms/vc-data-table/types";
import { VcButton, VcIcon } from "@ui/components/atoms";

// The grid's empty / not-found block: the same config and look as the table's empty state.
defineProps<{
  state: TableStateConfig;
}>();
</script>

<style lang="scss">
:root {
  --assets-folder-state-icon-color: var(--neutrals-300);
  --assets-folder-state-title-color: var(--neutrals-700);
  --assets-folder-state-description-color: var(--neutrals-500);
}

.assets-folder-state {
  @apply tw-flex tw-flex-col tw-flex-1 tw-items-center tw-justify-center tw-gap-2 tw-py-12 tw-px-4 tw-text-center;

  &__icon {
    @apply tw-mb-2 tw-text-[color:var(--assets-folder-state-icon-color)];
  }

  &__title {
    @apply tw-text-base tw-font-medium tw-text-[color:var(--assets-folder-state-title-color)];
  }

  &__description {
    @apply tw-text-sm tw-max-w-md tw-text-[color:var(--assets-folder-state-description-color)];
  }

  &__action {
    @apply tw-mt-4;
  }
}
</style>
