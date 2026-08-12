<template>
  <div
    class="vc-scheduler__week-row"
    :style="{ '--scheduler-month-max-lanes': laneCount }"
  >
    <div
      class="vc-scheduler__week-cells"
      role="row"
    >
      <MonthDayCell
        v-for="(d, col) in days"
        :key="col"
        :date="d.date"
        :in-month="d.inMonth"
        :is-today="d.isToday"
        :is-weekend="d.isWeekend"
        @cell-pointerdown="(ev) => emit('cell-pointerdown', { date: d.date, ev })"
      >
        <slot
          name="day-extra"
          :date="d.date"
          :col="col"
        />
        <!-- A real button, not a div: this is the only route to the 4th+ event on a day, so it
             has to be reachable by Tab and operable by Enter/Space (WCAG 2.1.1, 4.1.2). Its
             visible text is the accessible name; the date comes from the enclosing gridcell. -->
        <button
          v-if="overflow[col] > 0"
          type="button"
          class="vc-scheduler__more"
          @pointerdown.stop
          @click.stop="
            (e) => emit('more-click', { date: d.date, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() })
          "
        >
          {{ $t("VC_SCHEDULER.MORE", { count: overflow[col] }) }}
        </button>
      </MonthDayCell>
    </div>
    <div
      v-if="laidOut.length"
      class="vc-scheduler__week-lanes"
      role="row"
    >
      <div
        v-for="(x, i) in laidOut"
        :key="i"
        class="vc-scheduler__lane-slot"
        role="gridcell"
        :style="{ gridColumn: `${x.segment.startCol + 1} / ${x.segment.endCol + 2}`, gridRow: x.lane + 1 }"
      >
        <MonthEventBar
          :event="x.segment.event"
          :continues-left="x.segment.continuesLeft"
          :continues-right="x.segment.continuesRight"
          :selected="selectedId === x.segment.event.id"
          :editable="editable"
          @select="(rect) => emit('event-select', { id: x.segment.event.id, rect })"
          @move-start="(ev) => emit('event-move-start', { event: x.segment.event, ev })"
          @resize-start="(p) => emit('event-resize-start', { event: x.segment.event, edge: p.edge, ev: p.event })"
        >
          <template #default="{ event }"
            ><slot
              name="event"
              :event="event"
          /></template>
        </MonthEventBar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MonthDayCell from "./MonthDayCell.vue";
import { computed } from "vue";
import MonthEventBar from "./MonthEventBar.vue";
import type { IWeekEventSegment, ISchedulerEvent } from "../../types";

const props = defineProps<{
  days: { date: Date; inMonth: boolean; isToday: boolean; isWeekend: boolean }[];
  laidOut: { segment: IWeekEventSegment; lane: number }[];
  overflow: number[];
  timedByDay: Map<string, ISchedulerEvent[]>;
  selectedId: string | null;
  editable: boolean;
}>();

// Reserve vertical space for exactly the lanes THIS week actually uses (0 when the
// week has no multi-day bars) so single-day timed chips sit at the top, not pushed
// down by a fixed 3-lane reserve.
const laneCount = computed(() => (props.laidOut.length ? Math.max(...props.laidOut.map((x) => x.lane)) + 1 : 0));
const emit = defineEmits<{
  (e: "event-select", p: { id: string; rect: DOMRect | null }): void;
  (e: "event-move-start", p: { event: ISchedulerEvent; ev: PointerEvent }): void;
  (e: "event-resize-start", p: { event: ISchedulerEvent; edge: "start" | "end"; ev: PointerEvent }): void;
  (e: "cell-pointerdown", p: { date: Date; ev: PointerEvent }): void;
  (e: "more-click", p: { date: Date; rect: DOMRect }): void;
}>();
</script>

<style lang="scss">
.vc-scheduler__week-row {
  position: relative;
  // Grow to fill spare height, but never shrink below the week's own content
  // (day number + reserved event lanes). Equal `flex: 1 1 0` forced every row to
  // the same height and clipped weeks that need 3 lanes; `1 0 auto` lets a busy
  // week keep its taller content basis while empty weeks still fill the grid.
  flex: 1 0 auto;
  min-height: 0;
  // Shared with MonthDayCell so its content area reserves exactly this much
  // vertical space, keeping timed chips / "+N more" clear of the lanes overlay.
  --scheduler-month-lane-height: 1.375rem;
  --scheduler-month-lane-gap: 2px;
  --scheduler-month-max-lanes: 3;
}
.vc-scheduler__week-cells {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  // Fill the flex-grown week row so day cells stretch to the row's full height —
  // otherwise cells stay at their min-height and leave a gap between weeks.
  height: 100%;
}
.vc-scheduler__week-lanes {
  position: absolute;
  left: 0;
  right: 0;
  top: 1.75rem; /* below day badge */
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: var(--scheduler-month-lane-height);
  gap: var(--scheduler-month-lane-gap);
  padding: 0 2px;
  pointer-events: none;
}
.vc-scheduler__lane-slot {
  pointer-events: auto;
  min-width: 0;
}
.vc-scheduler__more {
  // Strip the native button chrome so the control keeps the plain-text look it had as a div.
  appearance: none;
  background: none;
  border: 0;
  display: flex;
  align-items: center;
  width: 100%;
  font: inherit;
  text-align: left;
  font-size: 0.6875rem;
  color: var(--neutrals-600);
  cursor: pointer;
  padding: 0 0.25rem;
  // 24px minimum for WCAG 2.2 SC 2.5.8, matching the month event chip (PR #278). The text
  // alone is ~13px and this control now sits directly under the chips.
  min-height: 24px;
  &:hover {
    color: var(--primary-600);
  }
}
</style>
