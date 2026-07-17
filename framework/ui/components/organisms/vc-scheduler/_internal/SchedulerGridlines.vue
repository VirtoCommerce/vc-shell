<template>
  <div
    class="vc-scheduler__gridlines"
    :style="{ width: `${totalWidth}px`, height: `${height}px` }"
  >
    <div
      v-for="t in fineTicks"
      :key="t.x"
      class="vc-scheduler__gridline"
      :class="{ 'vc-scheduler__gridline--weekend': isWeekend(t.date) }"
      :style="{ transform: `translateX(${t.x}px)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { isWeekend } from "date-fns";
defineProps<{ fineTicks: { date: Date; x: number }[]; totalWidth: number; height: number }>();
</script>

<style lang="scss">
.vc-scheduler__gridlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.vc-scheduler__gridline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--scheduler-border-color, var(--neutrals-200));
  &--weekend {
    background: var(--neutrals-100);
    width: 100%;
    opacity: 0.5;
  } // tint, not a stripe
}
</style>
