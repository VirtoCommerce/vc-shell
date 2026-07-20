<template>
  <div
    class="vc-scheduler__header"
    :style="{ width: `${totalWidth}px` }"
  >
    <div class="vc-scheduler__header-row vc-scheduler__header-row--coarse">
      <div
        v-for="t in coarseTicks"
        :key="`c-${t.x}`"
        class="vc-scheduler__tick vc-scheduler__tick--coarse"
        :style="{ transform: `translateX(${t.x}px)` }"
      >
        {{ t.label }}
      </div>
    </div>
    <div class="vc-scheduler__header-row vc-scheduler__header-row--fine">
      <div
        v-for="t in fineTicks"
        :key="`f-${t.x}`"
        class="vc-scheduler__tick vc-scheduler__tick--fine"
        :style="{ transform: `translateX(${t.x}px)` }"
      >
        <slot
          name="header-cell"
          :tick="t"
          >{{ formatFine(t.date) }}</slot
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import type { SchedulerZoom } from "../types";

const props = defineProps<{
  fineTicks: { date: Date; x: number }[];
  coarseTicks: { date: Date; x: number; label: string }[];
  zoom: SchedulerZoom;
  totalWidth: number;
}>();

function formatFine(date: Date): string {
  switch (props.zoom) {
    case "hour":
      return format(date, "HH:mm");
    case "day":
      return format(date, "d");
    case "week":
      return format(date, "'W'w");
    case "month":
      return format(date, "MMM");
    case "quarter":
      return format(date, "QQQ");
    case "year":
      return format(date, "yyyy");
    default:
      return format(date, "d");
  }
}
</script>

<style lang="scss">
.vc-scheduler__header {
  position: relative;
  height: 3rem;
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-200));
  background: var(--neutrals-50);
}
.vc-scheduler__header-row {
  position: relative;
  height: 1.5rem;
}
.vc-scheduler__tick {
  position: absolute;
  top: 0;
  padding-left: 0.25rem;
  font-size: 0.75rem;
  color: var(--neutrals-600);
  white-space: nowrap;
  border-left: 0; // borders live on gridlines, not ticks (avoid side-stripe)
}
.vc-scheduler__tick--coarse {
  font-weight: 600;
  color: var(--neutrals-800);
}
</style>
