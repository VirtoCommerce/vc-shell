<template>
  <div
    class="vc-scheduler__bar"
    :class="{
      'vc-scheduler__bar--selected': selected,
      'vc-scheduler__bar--editable': editable,
      'vc-scheduler__bar--past': isPast,
    }"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    :style="barStyle"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @pointerdown.self="editable && emit('move-start', $event)"
  >
    <span class="vc-scheduler__bar-label">
      <slot :bar="bar">{{ bar.label }}</slot>
    </span>
    <template v-if="editable">
      <span
        class="vc-scheduler__bar-handle vc-scheduler__bar-handle--start"
        @pointerdown.stop="emit('resize-start', { edge: 'start', event: $event })"
      />
      <span
        class="vc-scheduler__bar-handle vc-scheduler__bar-handle--end"
        @pointerdown.stop="emit('resize-start', { edge: 'end', event: $event })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";
import { eventSurfaceStyle } from "../composables/useEventColor";
import type { ISchedulerBar } from "../types";

const props = defineProps<{
  bar: ISchedulerBar;
  x: number;
  width: number;
  top: number;
  height: number;
  editable: boolean;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "move-start", event: PointerEvent): void;
  (e: "resize-start", payload: { edge: "start" | "end"; event: PointerEvent }): void;
}>();

const isPast = computed(() => props.bar.end.getTime() < Date.now());
const barStyle = computed(() => ({
  transform: `translate(${props.x}px, ${props.top}px)`,
  width: `${Math.max(props.width, 4)}px`,
  height: `${props.height}px`,
  ...eventSurfaceStyle(props.bar.color ?? "var(--primary-500)", isPast.value),
}));
const ariaLabel = computed(
  () => `${props.bar.label ?? "period"}: ${format(props.bar.start, "PP")} – ${format(props.bar.end, "PP")}`,
);
</script>

<style lang="scss">
.vc-scheduler__bar {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0 0.5rem;
  overflow: hidden;
  color: #fff;
  font-size: 0.8125rem;
  cursor: pointer;
  transition:
    box-shadow 150ms ease-out,
    filter 150ms ease-out;
  will-change: transform;

  // Past state = pale tint + dark ink applied inline (eventSurfaceStyle); no wash filter.
  &:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    filter: brightness(1.05);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-700);
    outline-offset: 1px;
  }
  &--selected {
    box-shadow: 0 0 0 2px var(--accent-500);
  }
}
.vc-scheduler__bar-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
.vc-scheduler__bar-handle {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  opacity: 0;
  transition: opacity 150ms ease-out;
  &--start {
    left: 0;
  }
  &--end {
    right: 0;
  }
}
.vc-scheduler__bar:hover .vc-scheduler__bar-handle,
.vc-scheduler__bar--selected .vc-scheduler__bar-handle {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__bar,
  .vc-scheduler__bar-handle {
    transition: none;
  }
}
</style>
