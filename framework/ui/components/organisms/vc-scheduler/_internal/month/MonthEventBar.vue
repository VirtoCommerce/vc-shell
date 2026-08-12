<template>
  <div
    ref="rootRef"
    class="vc-scheduler__event-bar"
    :class="{
      'vc-scheduler__event-bar--selected': selected,
      'vc-scheduler__event-bar--continues-left': continuesLeft,
      'vc-scheduler__event-bar--continues-right': continuesRight,
      'vc-scheduler__event-bar--past': isPast,
    }"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    :style="barStyle"
    @click="onSelect"
    @keydown.enter.prevent="onSelect"
    @pointerdown.self="editable && emit('move-start', $event)"
  >
    <span
      v-if="continuesLeft"
      class="vc-scheduler__event-bar-arrow"
      aria-hidden="true"
      >‹</span
    >
    <span class="vc-scheduler__event-bar-title"
      ><slot :event="event">{{ event.title }}</slot></span
    >
    <span
      v-if="isRecurring"
      class="vc-scheduler__event-bar-recur"
      aria-hidden="true"
      >↻</span
    >
    <span
      v-if="continuesRight"
      class="vc-scheduler__event-bar-arrow"
      aria-hidden="true"
      >›</span
    >
    <template v-if="editable">
      <span
        class="vc-scheduler__event-bar-handle vc-scheduler__event-bar-handle--start"
        @pointerdown.stop="emit('resize-start', { edge: 'start', event: $event })"
      />
      <span
        class="vc-scheduler__event-bar-handle vc-scheduler__event-bar-handle--end"
        @pointerdown.stop="emit('resize-start', { edge: 'end', event: $event })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { format } from "date-fns";
import { autoEventColor, readableInk, eventSurfaceStyle } from "../../composables/useEventColor";
import type { ISchedulerEvent } from "../../types";

const props = defineProps<{
  event: ISchedulerEvent;
  continuesLeft: boolean;
  continuesRight: boolean;
  selected: boolean;
  editable: boolean;
}>();
const emit = defineEmits<{
  (e: "select", rect: DOMRect | null): void;
  (e: "move-start", ev: PointerEvent): void;
  (e: "resize-start", p: { edge: "start" | "end"; event: PointerEvent }): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
function onSelect() {
  emit("select", rootRef.value?.getBoundingClientRect() ?? null);
}

const isRecurring = computed(() => !!(props.event.recurrenceId || props.event.recurrence));
const fill = computed(() => props.event.color ?? autoEventColor(props.event.title));
const isPast = computed(() => props.event.end.getTime() < Date.now());
const barStyle = computed(() =>
  isPast.value
    ? eventSurfaceStyle(fill.value, true)
    : { background: fill.value, color: `var(--vc-scheduler-event-ink, ${readableInk(fill.value)})` },
);
const ariaLabel = computed(() => {
  const { title, start, end } = props.event;
  // Bars only ever render all-day spans (useSchedulerEvents.weekSegments skips the rest), and an
  // all-day end is exclusive: midnight belongs to the previous calendar day. Formatting it raw
  // announced a one-day event as a two-day range. Same convention as the layout code and the
  // quick-info popover, which were already correct.
  const startLabel = format(start, "PP");
  const endLabel = format(new Date(end.getTime() - 1), "PP");
  return startLabel === endLabel ? `${title}: ${startLabel}` : `${title}: ${startLabel} – ${endLabel}`;
});
</script>

<style lang="scss">
.vc-scheduler__event-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.125rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  overflow: hidden;
  transition:
    box-shadow 150ms ease-out,
    filter 150ms ease-out;
  &--continues-left {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &--continues-right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  // Past state is a pale tint + dark ink applied inline (see eventSurfaceStyle) so it stays
  // AA-legible; no wash-to-white filter here.
  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 1px 4px rgb(0 0 0 / 25%);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-700);
    outline-offset: 1px;
  }
  &--selected {
    box-shadow: 0 0 0 2px var(--accent-500);
  }
}
.vc-scheduler__event-bar-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
.vc-scheduler__event-bar-recur {
  flex: none;
  font-size: 0.75rem;
  color: inherit;
  pointer-events: none;
}
.vc-scheduler__event-bar-handle {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  opacity: 0;
  &--start {
    left: 0;
  }
  &--end {
    right: 0;
  }
}
.vc-scheduler__event-bar:hover .vc-scheduler__event-bar-handle,
.vc-scheduler__event-bar--selected .vc-scheduler__event-bar-handle {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__event-bar {
    transition: none;
  }
}
</style>
