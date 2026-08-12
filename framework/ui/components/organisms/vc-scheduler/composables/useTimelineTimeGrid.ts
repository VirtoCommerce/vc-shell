import { computed, type ComputedRef, type Ref } from "vue";
import { startOfDay, addDays, differenceInCalendarDays, format, isToday, isWeekend } from "date-fns";
import type { ISchedulerEvent } from "../types";

// Vertical time-grid layout (Google/Outlook day & week model): hours run down the Y axis,
// days across the X axis. Timed events are positioned by their start/duration and split into
// side-by-side lanes when they overlap; all-day / multi-day events go to a separate spanning
// strip above the grid (a single-day time column can't represent a multi-day span).

export interface TimeGridOptions {
  events: Ref<ISchedulerEvent[]>;
  /** First rendered day (any time; normalized to 00:00). */
  rangeStart: Ref<Date>;
  /** Days rendered: 1 = day view, 7 = week view. */
  dayCount: Ref<number>;
  /** Inclusive first hour shown, 0-23. */
  startHour: Ref<number>;
  /** Exclusive last hour shown, 1-24. */
  endHour: Ref<number>;
  /** Pixel height of one hour row. */
  hourHeight: Ref<number>;
}

export interface DayColumn {
  date: Date;
  index: number;
  isToday: boolean;
  isWeekend: boolean;
  /** "Mon 6" style label for the day header. */
  label: string;
}

export interface HourLabel {
  hour: number;
  /** "9 AM" style label. */
  label: string;
  /** y offset in px from the grid top. */
  y: number;
}

export interface TimedRect {
  event: ISchedulerEvent;
  top: number;
  height: number;
  /** left/width as percentages of the day column (for overlap lanes). */
  leftPct: number;
  widthPct: number;
  past: boolean;
}

export interface AllDaySegment {
  event: ISchedulerEvent;
  /** 0-based day-column index where the segment starts within the rendered range. */
  startCol: number;
  /** Number of day columns the segment spans. */
  span: number;
  /** Stack row within the all-day strip. */
  row: number;
  continuesLeft: boolean;
  continuesRight: boolean;
  past: boolean;
}

const MIN_TIMED_HEIGHT = 18; // px — keep a one-line label legible for very short events
const HOUR_MS = 3_600_000;

/** Exported so views can apply the exclusive-end rule to all-day events when labelling them. */
export function isAllDayEvent(e: ISchedulerEvent): boolean {
  if (e.allDay !== undefined) return e.allDay;
  return e.end.getTime() - e.start.getTime() >= 86_400_000;
}

/**
 * Greedy interval partition: assign each event the lowest free lane, and compute the lane
 * count of the overlap cluster it belongs to (so overlapping events share the column evenly).
 */
function packLanes(items: { event: ISchedulerEvent; startMs: number; endMs: number }[]) {
  const sorted = [...items].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  const out: { event: ISchedulerEvent; startMs: number; endMs: number; lane: number; laneCount: number }[] = [];
  let cluster: (typeof out)[number][] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    const laneCount = cluster.reduce((m, c) => Math.max(m, c.lane + 1), 0);
    for (const c of cluster) c.laneCount = laneCount;
    cluster = [];
  };
  const laneEnds: number[] = [];
  for (const it of sorted) {
    if (it.startMs >= clusterEnd && cluster.length) {
      flush();
      laneEnds.length = 0;
    }
    let lane = laneEnds.findIndex((end) => end <= it.startMs);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(it.endMs);
    } else {
      laneEnds[lane] = it.endMs;
    }
    const entry = { ...it, lane, laneCount: 1 };
    out.push(entry);
    cluster.push(entry);
    clusterEnd = Math.max(clusterEnd, it.endMs);
  }
  flush();
  return out;
}

export function useTimelineTimeGrid(opts: TimeGridOptions) {
  const dayCount = computed(() => Math.max(1, opts.dayCount.value));
  const hourCount = computed(() => Math.max(1, opts.endHour.value - opts.startHour.value));
  const gridHeight = computed(() => hourCount.value * opts.hourHeight.value);

  const days = computed<Date[]>(() => {
    const base = startOfDay(opts.rangeStart.value);
    return Array.from({ length: dayCount.value }, (_, i) => addDays(base, i));
  });

  const columns = computed<DayColumn[]>(() =>
    days.value.map((date, index) => ({
      date,
      index,
      isToday: isToday(date),
      isWeekend: isWeekend(date),
      label: format(date, dayCount.value === 1 ? "EEEE, d MMMM" : "EEE d"),
    })),
  );

  const hourLabels = computed<HourLabel[]>(() => {
    const out: HourLabel[] = [];
    for (let h = opts.startHour.value; h < opts.endHour.value; h++) {
      const d = new Date(days.value[0] ?? opts.rangeStart.value);
      d.setHours(h, 0, 0, 0);
      out.push({ hour: h, label: format(d, "h a"), y: (h - opts.startHour.value) * opts.hourHeight.value });
    }
    return out;
  });

  const now = () => Date.now();

  // Timed events per day column, lane-split. Index of the outer array = day-column index.
  const timedByColumn = computed<TimedRect[][]>(() => {
    const hStart = opts.startHour.value;
    const hh = opts.hourHeight.value;
    const nowMs = now();
    return days.value.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(hStart, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(opts.endHour.value, 0, 0, 0);
      const ws = dayStart.getTime();
      const we = dayEnd.getTime();
      const visible = opts.events.value
        .filter((e) => !isAllDayEvent(e) && e.end.getTime() > ws && e.start.getTime() < we)
        .map((event) => ({
          event,
          startMs: Math.max(event.start.getTime(), ws),
          endMs: Math.min(event.end.getTime(), we),
        }));
      return packLanes(visible).map((p) => {
        const top = ((p.startMs - ws) / HOUR_MS) * hh;
        const height = Math.max(((p.endMs - p.startMs) / HOUR_MS) * hh, MIN_TIMED_HEIGHT);
        return {
          event: p.event,
          top,
          height,
          leftPct: (p.lane / p.laneCount) * 100,
          widthPct: 100 / p.laneCount,
          past: p.event.end.getTime() < nowMs,
        };
      });
    });
  });

  const hasTimed = computed(() => timedByColumn.value.some((col) => col.length > 0));

  // All-day / multi-day events as spanning segments, stacked into rows within the strip.
  const allDaySegments = computed<AllDaySegment[]>(() => {
    if (!days.value.length) return [];
    const gridStart = startOfDay(days.value[0]);
    const lastCol = days.value.length - 1;
    const nowMs = now();
    const segs = opts.events.value
      .filter(isAllDayEvent)
      .map((event) => {
        const startCol = differenceInCalendarDays(startOfDay(event.start), gridStart);
        // inclusive last day: an end at exact midnight belongs to the previous day
        const endCol = differenceInCalendarDays(startOfDay(new Date(event.end.getTime() - 1)), gridStart);
        const clampStart = Math.max(startCol, 0);
        const clampEnd = Math.min(endCol, lastCol);
        return {
          event,
          startCol: clampStart,
          span: clampEnd - clampStart + 1,
          rawStart: startCol,
          rawEnd: endCol,
          continuesLeft: startCol < 0,
          continuesRight: endCol > lastCol,
          past: event.end.getTime() < nowMs,
        };
      })
      .filter((s) => s.startCol <= lastCol && s.span > 0)
      .sort((a, b) => a.startCol - b.startCol || b.span - a.span);

    // Greedy row packing so overlapping spans stack instead of colliding.
    const rowEnds: number[] = [];
    return segs.map((s) => {
      let row = rowEnds.findIndex((end) => end < s.startCol);
      if (row === -1) {
        row = rowEnds.length;
        rowEnds.push(s.startCol + s.span - 1);
      } else {
        rowEnds[row] = s.startCol + s.span - 1;
      }
      return {
        event: s.event,
        startCol: s.startCol,
        span: s.span,
        row,
        continuesLeft: s.continuesLeft,
        continuesRight: s.continuesRight,
        past: s.past,
      };
    });
  });

  const allDayRowCount = computed(() => allDaySegments.value.reduce((m, s) => Math.max(m, s.row + 1), 0));

  return {
    dayCount,
    hourCount,
    gridHeight,
    days,
    columns,
    hourLabels,
    timedByColumn,
    hasTimed,
    allDaySegments,
    allDayRowCount,
  } as {
    dayCount: ComputedRef<number>;
    hourCount: ComputedRef<number>;
    gridHeight: ComputedRef<number>;
    days: ComputedRef<Date[]>;
    columns: ComputedRef<DayColumn[]>;
    hourLabels: ComputedRef<HourLabel[]>;
    timedByColumn: ComputedRef<TimedRect[][]>;
    hasTimed: ComputedRef<boolean>;
    allDaySegments: ComputedRef<AllDaySegment[]>;
    allDayRowCount: ComputedRef<number>;
  };
}
