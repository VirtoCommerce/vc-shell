<template>
  <div
    class="vc-scheduler__row"
    :style="{ height: `${height}px` }"
  >
    <SchedulerBar
      v-for="pb in packedBars"
      :key="pb.id"
      :bar="pb"
      :x="dateToX(pb.start)"
      :width="dateToX(pb.end) - dateToX(pb.start)"
      :top="pb.lane * (laneHeight + laneGap)"
      :height="laneHeight"
      :editable="editable && (pb.editable ?? true)"
      :selected="selectedId === pb.id"
      @select="emit('bar-select', pb.id)"
      @move-start="(ev) => emit('bar-move-start', { bar: pb, event: ev })"
      @resize-start="(p) => emit('bar-resize-start', { bar: pb, ...p })"
    >
      <template #default="{ bar }"
        ><slot
          name="bar"
          :bar="bar"
      /></template>
    </SchedulerBar>
  </div>
</template>

<script setup lang="ts">
import SchedulerBar from "./SchedulerBar.vue";
import type { IPackedBar, ISchedulerBar } from "../types";

defineProps<{
  packedBars: IPackedBar[];
  dateToX: (d: Date) => number;
  laneHeight: number;
  laneGap: number;
  height: number;
  editable: boolean;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: "bar-select", id: string): void;
  (e: "bar-move-start", p: { bar: ISchedulerBar; event: PointerEvent }): void;
  (e: "bar-resize-start", p: { bar: ISchedulerBar; edge: "start" | "end"; event: PointerEvent }): void;
}>();
</script>

<style lang="scss">
.vc-scheduler__row {
  position: relative;
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-200));
}
</style>
