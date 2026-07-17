import { computed, type ComputedRef, type Ref } from "vue";
import { format, startOfDay, differenceInCalendarDays } from "date-fns";
import type { ISchedulerEvent, IWeekEventSegment } from "../types";

const DAY_MS = 86_400_000;

export interface UseSchedulerEventsOptions {
  events: Ref<ISchedulerEvent[]>;
  /** `monthRange.start` is a local week-start midnight (see useSchedulerNavigation) — grid day 0. */
  monthRange: Ref<{ start: Date; end: Date }>;
  firstDayOfWeek: Ref<number>;
}

export function useSchedulerEvents(opts: UseSchedulerEventsOptions) {
  const isAllDay = (e: ISchedulerEvent): boolean => {
    if (e.allDay !== undefined) return e.allDay;
    return e.end.getTime() - e.start.getTime() >= DAY_MS;
  };

  const weekSegments: ComputedRef<IWeekEventSegment[][]> = computed(() => {
    const rows: IWeekEventSegment[][] = [[], [], [], [], [], []];
    const gridStart = startOfDay(opts.monthRange.value.start);

    for (const e of opts.events.value) {
      if (!isAllDay(e)) continue;

      const evStartDay = differenceInCalendarDays(startOfDay(e.start), gridStart);
      // Inclusive last day: an end at exact local midnight belongs to the previous calendar day.
      const evEndDay = differenceInCalendarDays(startOfDay(new Date(e.end.getTime() - 1)), gridStart);

      for (let row = 0; row < 6; row++) {
        const rowStart = row * 7;
        const rowEnd = rowStart + 6;
        const segStart = Math.max(evStartDay, rowStart);
        const segEnd = Math.min(evEndDay, rowEnd);
        if (segStart > segEnd) continue;

        rows[row].push({
          event: e,
          startCol: segStart - rowStart,
          endCol: segEnd - rowStart,
          continuesLeft: evStartDay < rowStart,
          continuesRight: evEndDay > rowEnd,
        });
      }
    }

    return rows;
  });

  const timedByDay: ComputedRef<Map<string, ISchedulerEvent[]>> = computed(() => {
    const map = new Map<string, ISchedulerEvent[]>();

    for (const e of opts.events.value) {
      if (isAllDay(e)) continue;
      const key = format(e.start, "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }

    for (const list of map.values()) list.sort((a, b) => a.start.getTime() - b.start.getTime());

    return map;
  });

  return { isAllDay, weekSegments, timedByDay };
}
