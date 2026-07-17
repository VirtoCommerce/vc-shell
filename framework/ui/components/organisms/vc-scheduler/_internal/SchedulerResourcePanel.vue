<template>
  <div
    class="vc-scheduler__resource-panel"
    :style="{ width: `${width}px` }"
  >
    <div
      v-for="r in resources"
      :key="r.id"
      class="vc-scheduler__resource-cell"
      :style="{ height: `${rowHeight(r.id)}px` }"
    >
      <slot
        name="resource"
        :resource="r"
        >{{ r.label }}</slot
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISchedulerResource } from "../types";
defineProps<{ resources: ISchedulerResource[]; rowHeight: (id: string) => number; width: number }>();
</script>

<style lang="scss">
.vc-scheduler__resource-panel {
  position: sticky;
  left: 0;
  z-index: var(--z-local-sticky);
  flex: 0 0 auto;
  background: var(--neutrals-50);
  border-right: 1px solid var(--scheduler-border-color, var(--neutrals-200));
}
.vc-scheduler__resource-cell {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: var(--neutrals-800);
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-200));
}
</style>
