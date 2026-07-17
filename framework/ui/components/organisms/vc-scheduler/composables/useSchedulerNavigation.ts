import { computed, type ComputedRef, type Ref } from "vue";
import { startOfMonth, startOfWeek, endOfWeek, addMonths, addDays, addWeeks, format } from "date-fns";
import type { SchedulerView } from "../types";

export interface UseSchedulerNavigationOptions {
  date: Ref<Date>;
  view: Ref<SchedulerView>;
  firstDayOfWeek: Ref<number>;
  onDateChange: (d: Date) => void;
}

export function useSchedulerNavigation(opts: UseSchedulerNavigationOptions) {
  const weekOpts = () => ({ weekStartsOn: (opts.firstDayOfWeek.value % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

  const monthRange: ComputedRef<{ start: Date; end: Date }> = computed(() => {
    const start = startOfWeek(startOfMonth(opts.date.value), weekOpts());
    // always 6 weeks (42 days) for stable height
    const end = new Date(start.getTime() + 42 * 86_400_000);
    return { start, end };
  });

  const title = computed(() => {
    const d = opts.date.value;
    switch (opts.view.value) {
      case "timeline-day":
        return format(d, "d MMMM yyyy");
      case "timeline-week": {
        const s = startOfWeek(d, weekOpts());
        const e = endOfWeek(d, weekOpts());
        return format(s, "MMM yyyy") === format(e, "MMM yyyy")
          ? `${format(s, "d")} – ${format(e, "d MMM yyyy")}`
          : `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
      }
      default:
        return format(d, "MMMM yyyy");
    }
  });

  const step = (dir: 1 | -1) => {
    const d = opts.date.value;
    switch (opts.view.value) {
      case "timeline-day":
        return addDays(d, dir);
      case "timeline-week":
        return addWeeks(d, dir);
      default:
        return addMonths(d, dir);
    }
  };

  const goPrev = () => opts.onDateChange(step(-1));
  const goNext = () => opts.onDateChange(step(1));
  const goToday = () => opts.onDateChange(new Date());

  return { monthRange, title, goPrev, goNext, goToday };
}
