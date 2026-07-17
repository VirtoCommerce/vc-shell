import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useSchedulerEvents } from "@ui/components/organisms/vc-scheduler/composables/useSchedulerEvents";
import type { ISchedulerEvent } from "@ui/components/organisms/vc-scheduler/types";

// Grid: Mon Jun 29 2026 .. (42 days), all constructed in LOCAL time to stay
// timezone/DST-robust (date-fns operates on local calendar days).
const monthRange = () => ref({ start: new Date(2026, 5, 29), end: new Date(2026, 5, 29 + 42) });
const ev = (o: Partial<ISchedulerEvent>): ISchedulerEvent => ({
  id: "x",
  title: "T",
  start: new Date(),
  end: new Date(),
  ...o,
});

describe("useSchedulerEvents", () => {
  it("classifies an all-day multi-day event and splits it across week rows", () => {
    const events = ref([ev({ id: "a", allDay: true, start: new Date(2026, 6, 2), end: new Date(2026, 6, 9) })]);
    const { weekSegments } = useSchedulerEvents({ events, monthRange: monthRange(), firstDayOfWeek: ref(1) });
    // Jul 2 (Thu, week row 0) .. Jul 8 inclusive spans row 0 then row 1
    const row0 = weekSegments.value[0].filter((s) => s.event.id === "a");
    const row1 = weekSegments.value[1].filter((s) => s.event.id === "a");
    expect(row0.length).toBe(1);
    expect(row1.length).toBe(1);
    expect(row0[0].continuesRight).toBe(true);
    expect(row1[0].continuesLeft).toBe(true);
  });

  it("puts a single-day timed event into timedByDay, not weekSegments", () => {
    const events = ref([
      ev({ id: "t", allDay: false, start: new Date(2026, 6, 3, 14, 0, 0), end: new Date(2026, 6, 3, 15, 0, 0) }),
    ]);
    const { weekSegments, timedByDay } = useSchedulerEvents({
      events,
      monthRange: monthRange(),
      firstDayOfWeek: ref(1),
    });
    expect(weekSegments.value.flat().some((s) => s.event.id === "t")).toBe(false);
    expect(timedByDay.value.get("2026-07-03")?.some((e) => e.id === "t")).toBe(true);
  });

  it("computes startCol/endCol within the week row", () => {
    const events = ref([ev({ id: "a", allDay: true, start: new Date(2026, 6, 2), end: new Date(2026, 6, 4) })]);
    const { weekSegments } = useSchedulerEvents({ events, monthRange: monthRange(), firstDayOfWeek: ref(1) });
    const seg = weekSegments.value[0].find((s) => s.event.id === "a")!;
    // Mon-start week row0 = Jun29..Jul5 → Jul2 is col 3 (Mon0 Tue1 Wed2 Thu3), Jul3 inclusive end col 4
    expect(seg.startCol).toBe(3);
    expect(seg.endCol).toBe(4);
  });
});
