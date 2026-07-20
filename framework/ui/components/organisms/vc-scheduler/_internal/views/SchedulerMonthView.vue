<template>
  <div class="vc-scheduler__month">
    <div
      class="vc-scheduler__month-grid"
      role="grid"
    >
      <div
        class="vc-scheduler__weekday-header"
        role="row"
      >
        <div
          v-for="(wd, i) in weekdayLabels"
          :key="i"
          class="vc-scheduler__weekday"
          role="columnheader"
        >
          {{ wd }}
        </div>
      </div>
      <div
        ref="gridRef"
        class="vc-scheduler__month-rows"
        role="rowgroup"
        tabindex="0"
      >
        <MonthWeekRow
          v-for="(row, r) in rows"
          :key="r"
          :days="row.days"
          :laid-out="row.laidOut"
          :overflow="row.overflow"
          :timed-by-day="events.timedByDay.value"
          :selected-id="selectedId"
          :editable="props.editable"
          @event-select="(p) => onEventSelect(p.id, p.rect)"
          @event-move-start="(p) => onMoveStart(p.event, p.ev)"
          @event-resize-start="(p) => onResizeStart(p.event, p.edge, p.ev)"
          @cell-pointerdown="(p) => onCellPointerDown(p.date, p.ev)"
          @more-click="(p) => openMore(p.date, p.rect)"
        >
          <template #event="{ event }">
            <slot
              name="event"
              :event="event"
            />
          </template>
          <template #day-extra="{ date }">
            <div
              v-for="chip in chipsForDay(date)"
              :key="chip.id"
              class="vc-scheduler__timed-chip"
              role="button"
              tabindex="0"
              :aria-label="`${chip.title}: ${format(chip.start, 'p')} – ${format(chip.end, 'p')}`"
              @pointerdown.stop
              @click.stop="onChipSelect(chip.id, $event)"
              @keydown.enter.prevent="onChipSelect(chip.id, $event)"
            >
              <span
                class="vc-scheduler__timed-chip-dot"
                :style="{ background: chip.color ?? autoEventColor(chip.title) }"
              />
              <span class="vc-scheduler__timed-chip-text">{{ format(chip.start, "HH:mm") }} {{ chip.title }}</span>
              <span
                v-if="chip.recurrenceId || chip.recurrence"
                class="vc-scheduler__timed-chip-recur"
                aria-hidden="true"
                >↻</span
              >
            </div>
          </template>
        </MonthWeekRow>
      </div>
    </div>
    <div
      v-if="!props.events.length"
      class="vc-scheduler__month-empty"
    >
      <span class="vc-scheduler__month-empty-pill">{{ $t("VC_SCHEDULER.EMPTY_HINT") }}</span>
    </div>
    <MonthMorePopover
      :open="moreOpen"
      :date="moreDate"
      :anchor-rect="moreAnchor"
      :events="moreEvents"
      @event-click="onEventClickRaw"
      @close="moreOpen = false"
    >
      <template #event="{ event }">
        <slot
          name="event"
          :event="event"
        />
      </template>
    </MonthMorePopover>
    <MonthEventPopover
      :open="eventPopoverOpen"
      :event="eventPopoverEvent"
      :anchor-rect="eventPopoverAnchor"
      :can-edit="props.editable && !!eventPopoverEvent && props.isEventEditable(eventPopoverEvent)"
      @close="closeEventPopover"
      @edit="onPopoverEdit"
      @delete="onPopoverDelete"
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
import { computed, ref, toRef, onUnmounted, nextTick } from "vue";
import {
  addDays,
  startOfMonth,
  startOfWeek,
  startOfDay,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  format,
} from "date-fns";
import MonthWeekRow from "../month/MonthWeekRow.vue";
import MonthMorePopover from "../month/MonthMorePopover.vue";
import MonthEventPopover from "../month/MonthEventPopover.vue";
import { useSchedulerEvents } from "../../composables/useSchedulerEvents";
import { useMonthLayout } from "../../composables/useMonthLayout";
import { autoEventColor } from "../../composables/useEventColor";
import { useEventInteraction, useClickDiscriminator, type ICreateIntent } from "../../composables/useEventInteraction";
import type { ISchedulerEvent } from "../../types";

const props = defineProps<{
  events: ISchedulerEvent[];
  focusedDate: Date;
  firstDayOfWeek: number;
  editable: boolean;
  isEventEditable: (e: ISchedulerEvent) => boolean;
  quickInfo: boolean;
}>();

const emit = defineEmits<{
  (e: "event-click", ev: ISchedulerEvent): void;
  (e: "create-intent", intent: ICreateIntent): void;
  (e: "event-update", u: { id: string; start: Date; end: Date }): void;
  (e: "edit-intent", ev: ISchedulerEvent): void;
  (e: "event-delete", p: { id: string }): void;
}>();

const gridRef = ref<HTMLElement | null>(null);

const monthRange = computed(() => {
  const weekStartsOn = (props.firstDayOfWeek % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const start = startOfWeek(startOfMonth(props.focusedDate), { weekStartsOn });
  return { start, end: addDays(start, 42) };
});

const days = computed(() =>
  Array.from({ length: 42 }, (_, i) => {
    const date = addDays(monthRange.value.start, i);
    return {
      date,
      inMonth: isSameMonth(date, props.focusedDate),
      isToday: isToday(date),
      isWeekend: [0, 6].includes(getDay(date)),
    };
  }),
);

const weekdayLabels = computed(() =>
  Array.from({ length: 7 }, (_, i) => format(addDays(monthRange.value.start, i), "EEEEEE")),
);

function dayFromPoint(clientX: number, clientY: number): Date | null {
  const el = gridRef.value;
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const col = Math.floor(((clientX - rect.left) / rect.width) * 7);
  const row = Math.floor(((clientY - rect.top) / rect.height) * 6);
  if (col < 0 || col > 6 || row < 0 || row > 5) return null;
  return addDays(monthRange.value.start, row * 7 + col);
}

const interaction = useEventInteraction({
  editable: toRef(props, "editable"),
  isEventEditable: (e) => props.isEventEditable(e),
  dayFromPoint,
  onUpdate: (u) => emit("event-update", u),
  // Create no longer commits immediately: single/double/drag are resolved below and
  // emitted as `create-intent`, so this callback is intentionally unused.
  onCreate: () => {},
});

// Feed layout from the optimistic (effectiveEvent) events so a drag preview updates live.
const effectiveEvents = computed(() => props.events.map((e) => interaction.effectiveEvent(e)));

const events = useSchedulerEvents({
  events: effectiveEvents,
  monthRange,
  firstDayOfWeek: toRef(props, "firstDayOfWeek"),
});

const layout = useMonthLayout({ weekSegments: events.weekSegments });

const rows = computed(() =>
  Array.from({ length: 6 }, (_, r) => ({
    days: days.value.slice(r * 7, r * 7 + 7),
    laidOut: layout.laidOut.value[r] ?? [],
    overflow: layout.overflowByDay.value[r] ?? [],
  })),
);

const selectedId = ref<string | null>(null);

function findEvent(id: string): ISchedulerEvent | undefined {
  return props.events.find((e) => e.id === id);
}

function onEventSelect(id: string, rect: DOMRect | null = null) {
  selectedId.value = id;
  const e = findEvent(id);
  if (!e) return;
  emit("event-click", e);
  if (props.quickInfo) openEventPopover(e, rect);
}

function onChipSelect(id: string, ev: MouseEvent | KeyboardEvent) {
  const rect = (ev.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null;
  onEventSelect(id, rect);
}

function chipsForDay(date: Date): ISchedulerEvent[] {
  return events.timedByDay.value.get(format(date, "yyyy-MM-dd")) ?? [];
}

// --- Drag wiring: window-level pointer listeners, attached only while a move/resize/create is active. ---

type ActiveKind = "move" | "resize" | "create" | null;
let activeKind: ActiveKind = null;

// Empty-cell click state (create gesture only): the anchor cell/rect for the pending
// click, and whether the pointer left that cell before pointer-up (→ a drag, not a click).
let createAnchorDate: Date | null = null;
let createAnchorRect: DOMRect | null = null;
let createDragged = false;
// Anchors keyed by the clicked day (yyyy-MM-dd) so two rapid clicks on DIFFERENT cells never
// merge into a double — see useClickDiscriminator's per-key semantics.
const clickAnchors = new Map<string, { date: Date; rect: DOMRect | null }>();

// Resolves a lone click to a `single` create-intent after the delay, or a `double` if a
// second click on the same cell arrives first. Real drags bypass this entirely (see below).
const clickDiscriminator = useClickDiscriminator({
  onIntent: (kind, key) => {
    const anchor = clickAnchors.get(key);
    clickAnchors.delete(key);
    if (!anchor) return;
    const dayStart = startOfDay(anchor.date);
    emit("create-intent", { start: dayStart, end: addDays(dayStart, 1), allDay: true, anchorRect: anchor.rect, kind });
  },
});

function onMoveStart(event: ISchedulerEvent, ev: PointerEvent) {
  if (!props.editable) return;
  activeKind = "move";
  interaction.beginMove(event, ev.clientX, ev.clientY);
  attachDragListeners();
}
function onResizeStart(event: ISchedulerEvent, edge: "start" | "end", ev: PointerEvent) {
  if (!props.editable) return;
  activeKind = "resize";
  interaction.beginResize(event, edge, ev.clientX, ev.clientY);
  attachDragListeners();
}
function onCellPointerDown(date: Date, ev: PointerEvent) {
  if (!props.editable) return;
  activeKind = "create";
  createAnchorDate = date;
  createAnchorRect = (ev.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null;
  createDragged = false;
  interaction.beginCreate(date);
  attachDragListeners();
}
function onWindowPointerMove(e: PointerEvent) {
  if (!interaction.pending.value) return;
  interaction.updatePointer(e.clientX, e.clientY);
  if (activeKind === "create" && createAnchorDate && !createDragged) {
    const d = dayFromPoint(e.clientX, e.clientY);
    if (d && !isSameDay(d, createAnchorDate)) createDragged = true;
  }
}
function onWindowPointerUp() {
  if (activeKind === "create") {
    if (createDragged) {
      // A real drag: cancel any pending click resolution and fire the dragged range now.
      clickDiscriminator.cancel();
      clickAnchors.clear();
      const p = interaction.pending.value;
      if (p) {
        emit("create-intent", { start: p.start, end: p.end, allDay: true, anchorRect: createAnchorRect, kind: "drag" });
      }
    } else if (createAnchorDate) {
      const key = format(createAnchorDate, "yyyy-MM-dd");
      clickAnchors.set(key, { date: createAnchorDate, rect: createAnchorRect });
      clickDiscriminator.click(key);
    }
    interaction.cancel();
    createAnchorDate = null;
    createAnchorRect = null;
    createDragged = false;
  } else {
    interaction.commit();
  }
  activeKind = null;
  detachDragListeners();
}
function attachDragListeners() {
  window.addEventListener("pointermove", onWindowPointerMove);
  window.addEventListener("pointerup", onWindowPointerUp);
}
function detachDragListeners() {
  window.removeEventListener("pointermove", onWindowPointerMove);
  window.removeEventListener("pointerup", onWindowPointerUp);
}
onUnmounted(() => {
  detachDragListeners();
  clickDiscriminator.cancel();
  clickAnchors.clear();
});

// --- "More" popover ---

const moreOpen = ref(false);
const moreDate = ref<Date | null>(null);
const moreAnchor = ref<DOMRect | null>(null);

function openMore(date: Date, rect: DOMRect) {
  moreDate.value = date;
  moreAnchor.value = rect;
  moreOpen.value = true;
}

const moreEvents = computed<ISchedulerEvent[]>(() => {
  if (!moreDate.value) return [];
  const day = startOfDay(moreDate.value).getTime();
  return effectiveEvents.value.filter((e) => {
    if (!events.isAllDay(e)) return false;
    const start = startOfDay(e.start).getTime();
    const end = startOfDay(new Date(e.end.getTime() - 1)).getTime();
    return start <= day && day <= end;
  });
});

function onEventClickRaw(e: ISchedulerEvent, rect: DOMRect | null = null) {
  selectedId.value = e.id;
  emit("event-click", e);
  moreOpen.value = false;
  // Open the quick-info popover like a normal event click. Deferred so the click that
  // closes the "+N more" popover doesn't immediately dismiss the new popover via
  // click-outside; anchor to the clicked row, falling back to the "+N more" cell.
  if (props.quickInfo) nextTick(() => openEventPopover(e, rect ?? moreAnchor.value));
}

// --- Quick-info event popover ---

const eventPopoverOpen = ref(false);
const eventPopoverEvent = ref<ISchedulerEvent | null>(null);
const eventPopoverAnchor = ref<DOMRect | null>(null);

function openEventPopover(e: ISchedulerEvent, rect: DOMRect | null) {
  eventPopoverEvent.value = e;
  eventPopoverAnchor.value = rect;
  eventPopoverOpen.value = true;
}
function closeEventPopover() {
  eventPopoverOpen.value = false;
}
function onPopoverEdit(e: ISchedulerEvent) {
  emit("edit-intent", e);
}
function onPopoverDelete(p: { id: string }) {
  emit("event-delete", p);
}
</script>

<style lang="scss">
.vc-scheduler__month {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.vc-scheduler__month-empty {
  // Centers a hint pill over the empty grid; must not intercept cell clicks.
  position: absolute;
  inset: 3rem 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.vc-scheduler__month-empty-pill {
  // A quiet chip (bg + hairline border, no elevation) so the empty state reads as an
  // integrated hint, not a floating tooltip and not text colliding with the grid.
  padding: 0.5rem 1rem;
  background: var(--neutrals-50, #fafafa);
  border: 1px solid var(--neutrals-200);
  border-radius: 0.5rem;
  color: var(--neutrals-600);
  font-size: 0.875rem;
}
.vc-scheduler__weekday-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid var(--scheduler-border-color, var(--neutrals-300));
}
.vc-scheduler__weekday {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--neutrals-600);
  text-align: center;
}
.vc-scheduler__month-grid {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  // No own border/radius: the VcScheduler root draws the single outer frame.
  overflow: hidden;
}
.vc-scheduler__month-rows {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  // Reserving lane space per cell (see MonthDayCell/MonthWeekRow) can make 6
  // full rows taller than a constrained host; scroll rather than silently
  // clip the last week when that happens.
  overflow-x: hidden;
  overflow-y: auto;
}
.vc-scheduler__timed-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  background: var(--neutrals-100);
  color: var(--neutrals-900);
  font-size: 0.6875rem;
  line-height: 1.2;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  transition: background-color 150ms ease-out;
  &:hover {
    background: var(--neutrals-200);
  }
}
.vc-scheduler__timed-chip-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.vc-scheduler__timed-chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.vc-scheduler__timed-chip-recur {
  flex: none;
  font-size: 0.625rem;
  color: var(--neutrals-600);
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__timed-chip {
    transition: none;
  }
}
</style>
