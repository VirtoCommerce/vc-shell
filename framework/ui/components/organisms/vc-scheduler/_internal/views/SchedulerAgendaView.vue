<template>
  <div class="vc-scheduler__agenda">
    <div
      v-if="!days.length"
      class="vc-scheduler__agenda-empty"
    >
      <slot name="empty">{{ $t("VC_SCHEDULER.EMPTY") }}</slot>
    </div>

    <ul
      v-else
      class="vc-scheduler__agenda-list"
    >
      <li
        v-for="day in days"
        :key="day.key"
        class="vc-scheduler__agenda-day"
      >
        <div
          class="vc-scheduler__agenda-day-header"
          :class="{ 'vc-scheduler__agenda-day-header--today': day.isToday }"
        >
          <span class="vc-scheduler__agenda-dow">{{ format(day.date, "EEE") }}</span>
          <span class="vc-scheduler__agenda-date">{{ format(day.date, "d MMM") }}</span>
        </div>
        <ul class="vc-scheduler__agenda-events">
          <li
            v-for="e in day.events"
            :key="e.id"
          >
            <button
              type="button"
              class="vc-scheduler__agenda-event"
              @click="(ev) => onSelect(e, ev)"
            >
              <span
                class="vc-scheduler__agenda-dot"
                :style="{ background: e.color ?? autoEventColor(e.title) }"
              />
              <span class="vc-scheduler__agenda-time">{{ timeLabel(e) }}</span>
              <span class="vc-scheduler__agenda-title">
                <slot
                  name="event"
                  :event="e"
                  >{{ e.title }}</slot
                >
              </span>
              <span
                v-if="spanLabel(e, day.date)"
                class="vc-scheduler__agenda-span"
                >{{ spanLabel(e, day.date) }}</span
              >
              <span
                v-if="e.recurrenceId || e.recurrence"
                class="vc-scheduler__agenda-recur"
                aria-hidden="true"
                >↻</span
              >
            </button>
          </li>
        </ul>
      </li>
    </ul>

    <MonthEventPopover
      :open="popoverOpen"
      :event="popoverEvent"
      :anchor-rect="popoverAnchor"
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
import { computed, ref } from "vue";
import {
  startOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  isToday,
  isSameDay,
  format,
  differenceInCalendarDays,
} from "date-fns";
import { useI18n } from "vue-i18n";
import MonthEventPopover from "../month/MonthEventPopover.vue";
import { autoEventColor } from "../../composables/useEventColor";
import type { ICreateIntent } from "../../composables/useEventInteraction";
import type { ISchedulerEvent } from "../../types";

const { t } = useI18n();

const props = defineProps<{
  events: ISchedulerEvent[];
  focusedDate: Date;
  editable: boolean;
  isEventEditable: (e: ISchedulerEvent) => boolean;
  quickInfo: boolean;
}>();

const emit = defineEmits<{
  (e: "event-click", ev: ISchedulerEvent): void;
  (e: "create-intent", intent: ICreateIntent): void;
  (e: "edit-intent", ev: ISchedulerEvent): void;
  (e: "event-delete", p: { id: string }): void;
}>();

const isAllDay = (e: ISchedulerEvent) =>
  e.allDay !== undefined ? e.allDay : e.end.getTime() - e.start.getTime() >= 86_400_000;

// Days of the focused month that have at least one event, each with its events
// (a multi-day event appears under every day it covers within the month).
const days = computed(() => {
  const first = startOfMonth(props.focusedDate);
  const last = endOfMonth(props.focusedDate);
  const out: { key: string; date: Date; isToday: boolean; events: ISchedulerEvent[] }[] = [];
  for (let d = startOfDay(first); d <= last; d = addDays(d, 1)) {
    const dayStart = d.getTime();
    const dayEnd = addDays(d, 1).getTime();
    const dayEvents = props.events
      .filter((e) => e.start.getTime() < dayEnd && e.end.getTime() > dayStart)
      .sort((a, b) => Number(isAllDay(b)) - Number(isAllDay(a)) || a.start.getTime() - b.start.getTime());
    if (dayEvents.length) {
      out.push({ key: format(d, "yyyy-MM-dd"), date: new Date(d), isToday: isToday(d), events: dayEvents });
    }
  }
  return out;
});

function timeLabel(e: ISchedulerEvent): string {
  if (isAllDay(e)) return t("VC_SCHEDULER.ALL_DAY");
  return isSameDay(e.start, e.end) ? format(e.start, "p") : format(e.start, "MMM d, p");
}

// For a multi-day event listed under each day it spans, mark which day of the span this is,
// so repeated rows read as one continuous event, not duplicates.
function spanLabel(e: ISchedulerEvent, dayDate: Date): string {
  const startDay = startOfDay(e.start);
  const endInclusive = startOfDay(new Date(e.end.getTime() - 1));
  const total = differenceInCalendarDays(endInclusive, startDay) + 1;
  if (total <= 1) return "";
  const n = differenceInCalendarDays(startOfDay(dayDate), startDay) + 1;
  return t("VC_SCHEDULER.DAY_N_OF_M", { n, total });
}

// Create is driven by the shared toolbar's "+ New event" button (see SchedulerToolbar);
// the agenda view no longer renders its own duplicate CTA.

// --- Quick-info popover (shared with the other views) ---
const popoverOpen = ref(false);
const popoverEvent = ref<ISchedulerEvent | null>(null);
const popoverAnchor = ref<DOMRect | null>(null);

function onSelect(event: ISchedulerEvent, ev: MouseEvent | KeyboardEvent) {
  emit("event-click", event);
  if (props.quickInfo) {
    popoverEvent.value = event;
    popoverAnchor.value = (ev.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null;
    popoverOpen.value = true;
  }
}
</script>

<style lang="scss">
.vc-scheduler__agenda {
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem 0.75rem;
}
.vc-scheduler__agenda-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 8rem;
  color: var(--neutrals-500);
  font-size: 0.875rem;
}
.vc-scheduler__agenda-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.vc-scheduler__agenda-day {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-200));
}
.vc-scheduler__agenda-day-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  color: var(--neutrals-600);
  &--today {
    color: var(--accent-600);
    font-weight: 600;
  }
}
.vc-scheduler__agenda-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutrals-800);
}
.vc-scheduler__agenda-day-header--today .vc-scheduler__agenda-date {
  color: var(--accent-600);
}
.vc-scheduler__agenda-events {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.vc-scheduler__agenda-event {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
  &:hover {
    background: var(--neutrals-100);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-700);
    outline-offset: 1px;
  }
}
.vc-scheduler__agenda-dot {
  flex: none;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
}
.vc-scheduler__agenda-time {
  flex: none;
  min-width: 4.5rem;
  font-size: 0.8125rem;
  color: var(--neutrals-600);
}
.vc-scheduler__agenda-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.875rem;
  color: var(--neutrals-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vc-scheduler__agenda-span {
  flex: none;
  font-size: 0.75rem;
  color: var(--neutrals-500);
  white-space: nowrap;
}
.vc-scheduler__agenda-recur {
  flex: none;
  font-size: 0.75rem;
  color: var(--neutrals-500);
  pointer-events: none;
}
</style>
