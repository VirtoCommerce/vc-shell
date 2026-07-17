import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useTimelineTimeGrid } from "./useTimelineTimeGrid";
import type { ISchedulerEvent } from "../types";

function grid(events: ISchedulerEvent[], over: Partial<{ dayCount: number; startHour: number; endHour: number }> = {}) {
  return useTimelineTimeGrid({
    events: ref(events),
    rangeStart: ref(new Date(2026, 0, 5)), // Mon Jan 5 2026
    dayCount: ref(over.dayCount ?? 1),
    startHour: ref(over.startHour ?? 0),
    endHour: ref(over.endHour ?? 24),
    hourHeight: ref(48),
  });
}

function timed(id: string, startH: number, endH: number, day = 5): ISchedulerEvent {
  return {
    id,
    title: id,
    start: new Date(2026, 0, day, startH, 0),
    end: new Date(2026, 0, day, endH, 0),
    allDay: false,
  };
}

describe("useTimelineTimeGrid", () => {
  it("positions a timed event by start hour and duration", () => {
    const g = grid([timed("a", 9, 11)]);
    const rect = g.timedByColumn.value[0][0];
    expect(rect.top).toBe(9 * 48);
    expect(rect.height).toBe(2 * 48);
    expect(rect.widthPct).toBe(100);
    expect(rect.leftPct).toBe(0);
  });

  it("splits two overlapping events into side-by-side lanes", () => {
    const g = grid([timed("a", 9, 11), timed("b", 10, 12)]);
    const col = g.timedByColumn.value[0];
    expect(col).toHaveLength(2);
    expect(col.every((r) => r.widthPct === 50)).toBe(true);
    expect(new Set(col.map((r) => r.leftPct))).toEqual(new Set([0, 50]));
  });

  it("gives non-overlapping events the full column width", () => {
    const g = grid([timed("a", 9, 10), timed("b", 11, 12)]);
    expect(g.timedByColumn.value[0].every((r) => r.widthPct === 100)).toBe(true);
  });

  it("enforces a minimum height for very short events", () => {
    const g = grid([timed("a", 9, 9)]); // zero-length
    expect(g.timedByColumn.value[0][0].height).toBeGreaterThanOrEqual(18);
  });

  it("routes all-day events to the all-day strip, not the time grid", () => {
    const allDay: ISchedulerEvent = {
      id: "ad",
      title: "Promo",
      start: new Date(2026, 0, 5),
      end: new Date(2026, 0, 6),
      allDay: true,
    };
    const g = grid([allDay], { dayCount: 7 });
    expect(g.timedByColumn.value.flat()).toHaveLength(0);
    expect(g.allDaySegments.value).toHaveLength(1);
    expect(g.allDaySegments.value[0].startCol).toBe(0);
    expect(g.allDaySegments.value[0].span).toBe(1);
  });

  it("spans a multi-day all-day event across day columns (week)", () => {
    const span: ISchedulerEvent = {
      id: "span",
      title: "Sale",
      start: new Date(2026, 0, 5), // Mon (col 0)
      end: new Date(2026, 0, 8), // exclusive -> Mon..Wed
      allDay: true,
    };
    const g = grid([span], { dayCount: 7 });
    const seg = g.allDaySegments.value[0];
    expect(seg.startCol).toBe(0);
    expect(seg.span).toBe(3);
  });

  it("stacks overlapping all-day spans into separate rows", () => {
    const a: ISchedulerEvent = {
      id: "a",
      title: "a",
      start: new Date(2026, 0, 5),
      end: new Date(2026, 0, 8),
      allDay: true,
    };
    const b: ISchedulerEvent = {
      id: "b",
      title: "b",
      start: new Date(2026, 0, 6),
      end: new Date(2026, 0, 9),
      allDay: true,
    };
    const g = grid([a, b], { dayCount: 7 });
    expect(g.allDayRowCount.value).toBe(2);
    expect(new Set(g.allDaySegments.value.map((s) => s.row))).toEqual(new Set([0, 1]));
  });

  it("builds hour labels for the visible range only", () => {
    const g = grid([], { startHour: 8, endHour: 18 });
    expect(g.hourLabels.value).toHaveLength(10);
    expect(g.hourLabels.value[0].hour).toBe(8);
    expect(g.hourLabels.value[0].y).toBe(0);
    expect(g.gridHeight.value).toBe(10 * 48);
  });

  it("renders 7 columns in week mode and 1 in day mode", () => {
    expect(grid([], { dayCount: 7 }).columns.value).toHaveLength(7);
    expect(grid([]).columns.value).toHaveLength(1);
  });
});
