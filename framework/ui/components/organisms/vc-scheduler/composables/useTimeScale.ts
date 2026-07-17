import { computed, type ComputedRef, type Ref } from "vue";
import {
  eachHourOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  startOfMonth,
  format,
} from "date-fns";
import type { SchedulerZoom, SchedulerSnap } from "../types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** ms of one fine unit + its base pixel width per zoom level. */
const UNIT: Record<SchedulerZoom, { ms: number; width: number }> = {
  hour: { ms: HOUR, width: 60 },
  day: { ms: DAY, width: 48 },
  week: { ms: 7 * DAY, width: 90 },
  month: { ms: 30 * DAY, width: 120 },
  quarter: { ms: 91 * DAY, width: 160 },
  year: { ms: 365 * DAY, width: 200 },
};

export interface UseTimeScaleOptions {
  zoom: Ref<SchedulerZoom>;
  range: Ref<{ start: Date; end: Date }>;
  snap?: Ref<SchedulerSnap>;
}

export function useTimeScale(opts: UseTimeScaleOptions) {
  const unitMs = computed(() => UNIT[opts.zoom.value].ms);
  const unitWidth = computed(() => UNIT[opts.zoom.value].width);
  const pxPerMs = computed(() => unitWidth.value / unitMs.value);

  const snapMs = computed(() => {
    const s = opts.snap?.value ?? "auto";
    return s === "auto" ? unitMs.value : s;
  });

  const totalWidth = computed(
    () => (opts.range.value.end.getTime() - opts.range.value.start.getTime()) * pxPerMs.value,
  );

  const dateToX = (date: Date) => (date.getTime() - opts.range.value.start.getTime()) * pxPerMs.value;
  const xToDate = (x: number) => new Date(opts.range.value.start.getTime() + x / pxPerMs.value);
  const snapDate = (date: Date) => {
    const step = snapMs.value;
    return new Date(Math.round(date.getTime() / step) * step);
  };

  const interval = () => ({ start: opts.range.value.start, end: opts.range.value.end });

  const fineTicks = computed(() => {
    const z = opts.zoom.value;
    let dates: Date[];

    if (z === "day") {
      // Manually generate UTC day boundaries to avoid timezone shifting in eachDayOfInterval
      dates = [];
      const current = new Date(opts.range.value.start);
      current.setUTCHours(0, 0, 0, 0);
      while (current.getTime() < opts.range.value.end.getTime()) {
        dates.push(new Date(current));
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      const gen: Record<SchedulerZoom, () => Date[]> = {
        hour: () => eachHourOfInterval(interval()),
        day: () => [], // Handled above
        week: () => eachWeekOfInterval(interval()),
        month: () => eachMonthOfInterval(interval()),
        quarter: () => eachQuarterOfInterval(interval()),
        year: () => eachYearOfInterval(interval()),
      };
      dates = gen[z]().filter((date) => {
        const t = date.getTime();
        return t >= opts.range.value.start.getTime() && t < opts.range.value.end.getTime();
      });
    }

    return dates.map((date) => ({ date, x: dateToX(date) }));
  });

  const coarseTicks = computed(() => {
    // One tier coarser than the fine unit; month labels for hour/day/week, year otherwise.
    const useYear = opts.zoom.value === "month" || opts.zoom.value === "quarter" || opts.zoom.value === "year";
    const dates = useYear ? eachYearOfInterval(interval()) : eachMonthOfInterval(interval());
    return dates.map((date) => ({
      date: startOfMonth(date),
      x: dateToX(date),
      label: format(date, useYear ? "yyyy" : "MMM yyyy"),
    }));
  });

  return {
    unitMs,
    unitWidth,
    snapMs,
    totalWidth,
    dateToX,
    xToDate,
    snapDate,
    fineTicks: fineTicks as ComputedRef<{ date: Date; x: number }[]>,
    coarseTicks: coarseTicks as ComputedRef<{ date: Date; x: number; label: string }[]>,
  };
}
