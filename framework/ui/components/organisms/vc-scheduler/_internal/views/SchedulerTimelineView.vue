<template>
  <div class="vc-scheduler__tg">
    <!-- Day headers -->
    <div class="vc-scheduler__tg-head">
      <div class="vc-scheduler__tg-gutter-spacer" />
      <div class="vc-scheduler__tg-head-cols">
        <div
          v-for="col in grid.columns.value"
          :key="`h-${col.index}`"
          class="vc-scheduler__tg-head-col"
          :class="{
            'vc-scheduler__tg-head-col--today': col.isToday,
            'vc-scheduler__tg-head-col--weekend': mode === 'week' && col.isWeekend,
          }"
        >
          {{ col.label }}
        </div>
      </div>
    </div>

    <!-- All-day / multi-day strip -->
    <div
      v-if="grid.allDaySegments.value.length"
      class="vc-scheduler__tg-allday"
    >
      <div class="vc-scheduler__tg-gutter-spacer vc-scheduler__tg-allday-label">
        {{ $t("VC_SCHEDULER.ALL_DAY") }}
      </div>
      <div
        class="vc-scheduler__tg-allday-track"
        :style="{ height: `${grid.allDayRowCount.value * ALLDAY_ROW + 4}px` }"
      >
        <button
          v-for="seg in grid.allDaySegments.value"
          :key="`ad-${seg.event.id}`"
          type="button"
          class="vc-scheduler__tg-allday-bar"
          :class="{
            'vc-scheduler__tg-allday-bar--past': seg.past,
            'vc-scheduler__tg-allday-bar--l': seg.continuesLeft,
            'vc-scheduler__tg-allday-bar--r': seg.continuesRight,
          }"
          :style="allDayStyle(seg)"
          :aria-label="ariaLabel(seg.event)"
          @click="(e) => onSelect(seg.event, e)"
        >
          <span class="vc-scheduler__tg-bar-title">
            <slot
              name="event"
              :event="seg.event"
              >{{ seg.event.title }}</slot
            >
          </span>
          <span
            v-if="seg.event.recurrenceId || seg.event.recurrence"
            class="vc-scheduler__tg-bar-recur"
            aria-hidden="true"
            >↻</span
          >
        </button>
      </div>
    </div>

    <!-- Scrollable time grid -->
    <div
      ref="scrollRef"
      class="vc-scheduler__tg-scroll"
    >
      <div
        class="vc-scheduler__tg-body"
        :style="{ height: `${grid.gridHeight.value}px` }"
      >
        <div class="vc-scheduler__tg-gutter">
          <div
            v-for="hl in grid.hourLabels.value"
            :key="`hl-${hl.hour}`"
            class="vc-scheduler__tg-hour-label"
            :style="{ top: `${hl.y}px` }"
          >
            {{ hl.label }}
          </div>
        </div>
        <div class="vc-scheduler__tg-cols">
          <div
            v-for="col in grid.columns.value"
            :key="`c-${col.index}`"
            class="vc-scheduler__tg-col"
            :class="{
              'vc-scheduler__tg-col--today': col.isToday,
              'vc-scheduler__tg-col--weekend': mode === 'week' && col.isWeekend,
            }"
            @click="(e) => onColumnClick(col.index, e)"
          >
            <div
              v-for="hl in grid.hourLabels.value"
              :key="`gl-${hl.hour}`"
              class="vc-scheduler__tg-gridline"
              :style="{ top: `${hl.y}px` }"
            />
            <div
              v-if="col.isToday && nowLineTop !== null"
              class="vc-scheduler__tg-now"
              :style="{ top: `${nowLineTop}px` }"
              aria-hidden="true"
            />
            <button
              v-for="rect in grid.timedByColumn.value[col.index]"
              :key="rect.event.id"
              type="button"
              class="vc-scheduler__tg-event"
              :class="{ 'vc-scheduler__tg-event--past': rect.past }"
              :style="eventStyle(rect)"
              :aria-label="ariaLabel(rect.event)"
              @click.stop="(e) => onSelect(rect.event, e)"
            >
              <span class="vc-scheduler__tg-event-time">{{ format(rect.event.start, "HH:mm") }}</span>
              <span class="vc-scheduler__tg-bar-title">
                <slot
                  name="event"
                  :event="rect.event"
                  >{{ rect.event.title }}</slot
                >
              </span>
              <span
                v-if="rect.event.recurrenceId || rect.event.recurrence"
                class="vc-scheduler__tg-bar-recur"
                aria-hidden="true"
                >↻</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!grid.hasTimed.value && !grid.allDaySegments.value.length"
      class="vc-scheduler__tg-empty"
    >
      <slot name="empty">{{ $t("VC_SCHEDULER.EMPTY") }}</slot>
    </div>

    <MonthEventPopover
      :open="popoverOpen"
      :event="popoverEvent"
      :anchor-rect="popoverAnchor"
      :can-edit="props.editable && !!popoverEvent && props.isEventEditable(popoverEvent)"
      @close="popoverOpen = false"
      @edit="(e) => emit('edit-intent', e)"
      @delete="(p) => emit('event-delete', p)"
    >
      <template #event-popover="{ event, close }">
        <slot
          name="event-popover"
          :event="event"
          :close="close"
        />
      </template>
    </MonthEventPopover>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { startOfDay, startOfWeek, format } from "date-fns";
import {
  useTimelineTimeGrid,
  isAllDayEvent,
  type TimedRect,
  type AllDaySegment,
} from "../../composables/useTimelineTimeGrid";
import { useClickDiscriminator, type ICreateIntent } from "../../composables/useEventInteraction";
import { autoEventColor, eventSurfaceStyle } from "../../composables/useEventColor";
import MonthEventPopover from "../month/MonthEventPopover.vue";
import type { ISchedulerEvent } from "../../types";

const HOUR_HEIGHT = 48; // px per hour row
const ALLDAY_ROW = 22; // px per stacked all-day segment

const props = withDefaults(
  defineProps<{
    events: ISchedulerEvent[];
    focusedDate: Date;
    firstDayOfWeek: number;
    editable: boolean;
    isEventEditable: (e: ISchedulerEvent) => boolean;
    quickInfo: boolean;
    mode: "day" | "week";
    dayStartHour?: number;
    dayEndHour?: number;
  }>(),
  { dayStartHour: 0, dayEndHour: 24 },
);

const emit = defineEmits<{
  (e: "event-click", ev: ISchedulerEvent): void;
  (e: "create-intent", intent: ICreateIntent): void;
  (e: "edit-intent", ev: ISchedulerEvent): void;
  (e: "event-delete", p: { id: string }): void;
}>();

const eventsRef = computed(() => props.events);
const dayCount = computed(() => (props.mode === "week" ? 7 : 1));
const startHour = computed(() => props.dayStartHour ?? 0);
const endHour = computed(() => props.dayEndHour ?? 24);
const hourHeight = computed(() => HOUR_HEIGHT);

const rangeStart = computed(() => {
  if (props.mode === "week") {
    const weekStartsOn = (props.firstDayOfWeek % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    return startOfWeek(props.focusedDate, { weekStartsOn });
  }
  return startOfDay(props.focusedDate);
});

const grid = useTimelineTimeGrid({
  events: eventsRef,
  rangeStart,
  dayCount,
  startHour,
  endHour,
  hourHeight,
});

function ariaLabel(e: ISchedulerEvent): string {
  // An all-day end is exclusive (midnight belongs to the previous day) and has no meaningful
  // time-of-day, so it is announced as whole dates with the last inclusive one. Timed events
  // keep their real start/end, times included.
  if (isAllDayEvent(e)) {
    const startLabel = format(e.start, "PP");
    const endLabel = format(new Date(e.end.getTime() - 1), "PP");
    return startLabel === endLabel ? `${e.title}: ${startLabel}` : `${e.title}: ${startLabel} – ${endLabel}`;
  }
  return `${e.title}: ${format(e.start, "PPp")} – ${format(e.end, "PPp")}`;
}

function eventStyle(rect: TimedRect) {
  const fill = rect.event.color ?? autoEventColor(rect.event.title);
  return {
    top: `${rect.top}px`,
    height: `${rect.height}px`,
    left: `calc(${rect.leftPct}% + 1px)`,
    width: `calc(${rect.widthPct}% - 2px)`,
    ...eventSurfaceStyle(fill, rect.past),
  };
}

function allDayStyle(seg: AllDaySegment) {
  const fill = seg.event.color ?? autoEventColor(seg.event.title);
  return {
    top: `${seg.row * ALLDAY_ROW + 2}px`,
    left: `calc(${(seg.startCol / grid.dayCount.value) * 100}% + 1px)`,
    width: `calc(${(seg.span / grid.dayCount.value) * 100}% - 2px)`,
    ...eventSurfaceStyle(fill, seg.past),
  };
}

// --- Scroll to the working hours on mount so the grid doesn't open on empty midnight rows ---
const scrollRef = ref<HTMLElement | null>(null);
onMounted(() => {
  const el = scrollRef.value;
  if (!el) return;
  // Prefer the first timed event; otherwise land on 08:00 (or the configured start).
  const firstTop = grid.timedByColumn.value.flat().reduce<number | null>((min, r) => {
    return min === null ? r.top : Math.min(min, r.top);
  }, null);
  const target = firstTop ?? Math.max(0, (8 - startHour.value) * HOUR_HEIGHT);
  el.scrollTop = Math.max(0, target - HOUR_HEIGHT / 2);
});

// --- Current-time ("now") line, drawn only in the today column while it's in the hour range ---
const nowTs = ref(Date.now());
let nowTimer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  nowTimer = setInterval(() => (nowTs.value = Date.now()), 60_000);
});
onUnmounted(() => {
  if (nowTimer) clearInterval(nowTimer);
});
const nowLineTop = computed<number | null>(() => {
  const d = new Date(nowTs.value);
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < startHour.value || h > endHour.value) return null;
  return (h - startHour.value) * HOUR_HEIGHT;
});

// --- Empty-slot click → create-intent (single/double; no drag-create on the timeline) ---
const clickAnchors = new Map<string, { start: Date; end: Date; rect: DOMRect }>();
const clickDiscriminator = useClickDiscriminator({
  onIntent: (kind, key) => {
    const anchor = clickAnchors.get(key);
    clickAnchors.delete(key);
    if (!anchor) return;
    emit("create-intent", { start: anchor.start, end: anchor.end, allDay: false, anchorRect: anchor.rect, kind });
  },
});

function onColumnClick(dayIndex: number, ev: MouseEvent) {
  if (!props.editable) return;
  if ((ev.target as HTMLElement | null)?.closest(".vc-scheduler__tg-event")) return;
  const colEl = ev.currentTarget as HTMLElement | null;
  const day = grid.days.value[dayIndex];
  if (!colEl || !day) return;
  const rect = colEl.getBoundingClientRect();
  const hourFloat = startHour.value + (ev.clientY - rect.top) / HOUR_HEIGHT;
  const hour = Math.min(Math.max(Math.floor(hourFloat), startHour.value), endHour.value - 1);
  const start = new Date(day);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + 3_600_000);
  const anchorRect = DOMRect.fromRect({ x: ev.clientX, y: ev.clientY, width: 1, height: HOUR_HEIGHT });
  const key = String(start.getTime());
  clickAnchors.set(key, { start, end, rect: anchorRect });
  clickDiscriminator.click(key);
}

onUnmounted(() => {
  clickDiscriminator.cancel();
  clickAnchors.clear();
});

// --- Quick-info popover (shared with Month view) ---
const popoverOpen = ref(false);
const popoverEvent = ref<ISchedulerEvent | null>(null);
const popoverAnchor = ref<DOMRect | null>(null);

function onSelect(event: ISchedulerEvent, ev: MouseEvent) {
  emit("event-click", event);
  if (props.quickInfo) {
    popoverEvent.value = event;
    popoverAnchor.value = (ev.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null;
    popoverOpen.value = true;
  }
}
</script>

<style lang="scss">
.vc-scheduler__tg {
  --scheduler-border-color: var(--neutrals-200);
  --tg-gutter-w: 3.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.vc-scheduler__tg-gutter-spacer {
  flex: none;
  width: var(--tg-gutter-w);
  border-right: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__tg-head {
  display: flex;
  flex: none;
  border-bottom: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__tg-head-cols {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
}
.vc-scheduler__tg-head-col {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.375rem 0.5rem;
  border-left: 1px solid var(--scheduler-border-color);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--neutrals-800);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:first-child {
    border-left: 0;
  }
  &--today {
    color: var(--accent-600);
  }
  &--weekend {
    background: var(--neutrals-50);
  }
}
.vc-scheduler__tg-allday {
  display: flex;
  flex: none;
  border-bottom: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__tg-allday-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.25rem 0.375rem 0 0;
  font-size: 0.625rem;
  color: var(--neutrals-500);
  text-transform: lowercase;
}
.vc-scheduler__tg-allday-track {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}
.vc-scheduler__tg-allday-bar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.125rem;
  height: 1.125rem;
  padding: 0 0.375rem;
  border: 0;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: filter 150ms ease-out;
  &--l {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &--r {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &:hover {
    filter: brightness(1.05);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-700);
    outline-offset: 1px;
  }
}
.vc-scheduler__tg-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.vc-scheduler__tg-body {
  display: flex;
  position: relative;
}
.vc-scheduler__tg-gutter {
  position: relative;
  flex: none;
  width: var(--tg-gutter-w);
  border-right: 1px solid var(--scheduler-border-color);
}
.vc-scheduler__tg-hour-label {
  position: absolute;
  right: 0.375rem;
  transform: translateY(-0.5em);
  font-size: 0.6875rem;
  color: var(--neutrals-600);
  white-space: nowrap;
}
.vc-scheduler__tg-cols {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
}
.vc-scheduler__tg-col {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  border-left: 1px solid var(--scheduler-border-color);
  &:first-child {
    border-left: 0;
  }
  &--today {
    background: var(--accent-50);
  }
  &--weekend {
    background: var(--neutrals-50);
  }
}
.vc-scheduler__tg-gridline {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--scheduler-border-color);
  pointer-events: none;
}
.vc-scheduler__tg-now {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px solid var(--danger-500);
  pointer-events: none;
  z-index: var(--z-local-above);
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: -4px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--danger-500);
  }
}
.vc-scheduler__tg-event {
  position: absolute;
  // One inline line (time + title) so short bars never clip a stacked second line;
  // taller bars just leave the colored block empty below the label, calendar-style.
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: filter 150ms ease-out;
  &:hover {
    filter: brightness(1.05);
    z-index: var(--z-local-above);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-700);
    outline-offset: 1px;
    z-index: var(--z-local-above);
  }
}
.vc-scheduler__tg-event-time {
  flex: none;
  font-weight: 600;
  opacity: 0.9;
}
.vc-scheduler__tg-bar-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
.vc-scheduler__tg-bar-recur {
  flex: none;
  font-size: 0.75rem;
  color: inherit;
  pointer-events: none;
}
.vc-scheduler__tg-empty {
  position: absolute;
  inset: auto 0 0;
  top: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutrals-500);
  font-size: 0.875rem;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__tg-event,
  .vc-scheduler__tg-allday-bar {
    transition: none;
  }
}
</style>
