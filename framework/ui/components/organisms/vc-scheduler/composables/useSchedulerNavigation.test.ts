import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useSchedulerNavigation } from "@ui/components/organisms/vc-scheduler/composables/useSchedulerNavigation";
import type { SchedulerView } from "../types";

const make = (over = {}) => {
  // Use local date to avoid timezone issues with date-fns (which operates in local time)
  const date = ref(new Date(2026, 6, 15)); // July 15, 2026 in local time
  const onDateChange = vi.fn((d: Date) => {
    date.value = d;
  });
  const nav = useSchedulerNavigation({
    date,
    view: ref("month"),
    firstDayOfWeek: ref(1),
    onDateChange,
    ...over,
  });
  return { date, onDateChange, nav };
};

describe("useSchedulerNavigation — month", () => {
  it("monthRange starts on the week containing the 1st (Mon start) and spans 42 days", () => {
    const { nav } = make();
    const { start, end } = nav.monthRange.value;
    // July 2026: 1st is Wed; Monday-start week begins Mon Jun 29
    expect(start.getDate()).toBe(29);
    expect(start.getMonth()).toBe(5); // June
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    expect(days).toBe(42);
  });

  it("title reflects the focused month", () => {
    const { nav } = make();
    expect(nav.title.value).toMatch(/July 2026|Jul 2026/);
  });

  it("goNext / goPrev move by one month via onDateChange", () => {
    const { nav, onDateChange, date } = make();
    nav.goNext();
    expect(onDateChange).toHaveBeenCalled();
    expect(date.value.getMonth()).toBe(7); // August
    nav.goPrev();
    expect(date.value.getMonth()).toBe(6); // back to July
  });
});

function setup(view: SchedulerView, date: Date) {
  const dateRef = ref(date);
  const onDateChange = vi.fn((d: Date) => (dateRef.value = d));
  const nav = useSchedulerNavigation({
    date: dateRef,
    view: ref(view),
    firstDayOfWeek: ref(1),
    onDateChange,
  });
  return { nav, onDateChange };
}

describe("useSchedulerNavigation view-aware step + title", () => {
  it("month: steps by a month, titles as 'MMMM yyyy'", () => {
    const { nav, onDateChange } = setup("month", new Date(2021, 0, 10));
    expect(nav.title.value).toBe("January 2021");
    nav.goNext();
    expect(onDateChange.mock.calls[0][0].getMonth()).toBe(1);
  });

  it("timeline-day: steps by a day, titles as 'd MMMM yyyy'", () => {
    const { nav, onDateChange } = setup("timeline-day", new Date(2021, 0, 10));
    expect(nav.title.value).toBe("10 January 2021");
    nav.goNext();
    expect(onDateChange.mock.calls[0][0].getDate()).toBe(11);
    nav.goPrev();
    expect(onDateChange.mock.calls[1][0].getDate()).toBe(10);
  });

  it("timeline-week: steps by a week, titles as a day range", () => {
    const { nav, onDateChange } = setup("timeline-week", new Date(2021, 0, 13)); // Wed
    // Week starts Monday (firstDayOfWeek=1): Jan 11 – 17.
    expect(nav.title.value).toBe("11 – 17 Jan 2021");
    nav.goNext();
    expect(onDateChange.mock.calls[0][0].getDate()).toBe(20);
  });
});
