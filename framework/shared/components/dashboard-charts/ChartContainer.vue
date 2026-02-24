<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div
    ref="containerRef"
    class="dashboard-chart-container"
    :style="cssVars"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ChartConfig } from "./types";

export interface Props {
  config: ChartConfig;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLElement>();

const cssVars = computed(() => {
  const vars: Record<string, string> = {};
  const keys = Object.keys(props.config);
  keys.forEach((key, index) => {
    const item = props.config[key];
    if (item.color) {
      vars[`--vis-color${index}`] = item.color;
    }
  });
  return vars;
});

defineSlots<{
  default: (props: any) => any;
}>();
</script>

<style lang="scss">
@use "./chart-theme";

.dashboard-chart-container {
  @apply tw-w-full tw-h-full tw-min-h-0;

  // Force Unovis host tooltip container to stay transparent.
  --vis-tooltip-padding: 0;
  --vis-tooltip-border-color: transparent;
  --vis-tooltip-background-color: transparent;
  --vis-tooltip-box-shadow: none;
  --vis-tooltip-backdrop-filter: none;
}
</style>
