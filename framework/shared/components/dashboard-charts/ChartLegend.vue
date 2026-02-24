<template>
  <div class="dashboard-chart-legend">
    <div
      v-for="(item, key) in config"
      :key="key"
      class="dashboard-chart-legend__item"
    >
      <span
        class="dashboard-chart-legend__indicator"
        :style="{ background: item.color }"
      />
      <span class="dashboard-chart-legend__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartConfig } from "./types";

export interface Props {
  config: ChartConfig;
}

defineProps<Props>();
</script>

<style lang="scss">
.dashboard-chart-legend {
  @apply tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-x-4 tw-gap-y-1 tw-px-3 tw-py-2;

  &__item {
    @apply tw-flex tw-items-center tw-gap-1.5 tw-text-xs;
    color: var(--neutrals-600);
  }

  &__indicator {
    @apply tw-w-2 tw-h-2 tw-rounded-full tw-flex-shrink-0;
  }
}
</style>
