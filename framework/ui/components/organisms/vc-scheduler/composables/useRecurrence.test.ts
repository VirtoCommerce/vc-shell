import { describe, it, expect } from "vitest";
import { parseRRule, toRRule, expandEvents } from "./useRecurrence";
import type { IRecurrenceRule, ISchedulerEvent } from "../types";

describe("RRULE bridge", () => {
  it("weekly with interval + byWeekday + count round-trips", () => {
    const rule = { freq: "weekly", interval: 2, byWeekday: [1, 3, 5], end: { type: "count", count: 10 } } as const;
    const str = toRRule(rule);
    expect(str).toContain("FREQ=WEEKLY");
    expect(str).toContain("INTERVAL=2");
    expect(str).toContain("COUNT=10");
    // BYDAY uses rrule weekday codes MO,WE,FR for JS 1,3,5
    expect(str).toContain("BYDAY=MO,WE,FR");
    const back = parseRRule(str, new Date(2026, 0, 5));
    expect(back.freq).toBe("weekly");
    expect(back.interval).toBe(2);
    expect(back.byWeekday?.sort()).toEqual([1, 3, 5]);
    expect(back.end).toEqual({ type: "count", count: 10 });
  });

  it("daily with until round-trips", () => {
    const until = new Date(2026, 5, 1);
    const str = toRRule({ freq: "daily", interval: 1, end: { type: "until", until } });
    expect(str).toContain("FREQ=DAILY");
    const back = parseRRule(str, new Date(2026, 0, 1));
    expect(back.freq).toBe("daily");
    expect(back.end.type).toBe("until");
  });

  it("until boundary is inclusive of the whole picked day for timed events", () => {
    // VcDatePicker type="date" yields "until" at local midnight of the picked day (no time
    // component). A 10:00 daily event with "until Jul 20" must still produce an occurrence
    // ON Jul 20 -- the raw midnight instant would exclude it.
    const dtstart = new Date(2026, 6, 15, 10, 0);
    const rule: IRecurrenceRule = {
      freq: "daily",
      interval: 1,
      end: { type: "until", until: new Date(2026, 6, 20) },
    };
    const rruleStr = toRRule(rule);
    const masterEvent: ISchedulerEvent = {
      id: "m-until",
      title: "Daily 10am",
      start: dtstart,
      end: new Date(2026, 6, 15, 10, 30),
      recurrence: rruleStr,
    };
    const julyWindow = { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31, 23, 59) };
    const out = expandEvents([masterEvent], julyWindow);
    const jul20 = out.find(
      (e) => e.start.getFullYear() === 2026 && e.start.getMonth() === 6 && e.start.getDate() === 20,
    );
    expect(jul20).toBeDefined();
  });

  it("monthly/yearly never-ending parse", () => {
    const m = parseRRule(toRRule({ freq: "monthly", interval: 1, end: { type: "never" } }), new Date(2026, 0, 15));
    expect(m.freq).toBe("monthly");
    expect(m.end).toEqual({ type: "never" });
    const y = parseRRule(toRRule({ freq: "yearly", interval: 1, end: { type: "never" } }), new Date(2026, 0, 15));
    expect(y.freq).toBe("yearly");
  });
});

const win = { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31, 23, 59) };
function master(over: Partial<ISchedulerEvent> = {}): ISchedulerEvent {
  return {
    id: "m1",
    title: "Standup",
    start: new Date(2026, 0, 5, 9, 0),
    end: new Date(2026, 0, 5, 9, 30),
    recurrence: "FREQ=WEEKLY;BYDAY=MO;COUNT=4",
    ...over,
  };
}

describe("expandEvents", () => {
  it("expands a weekly master into occurrences within the window", () => {
    const out = expandEvents([master()], win);
    // Mondays: Jan 5, 12, 19, 26 (COUNT=4)
    expect(out).toHaveLength(4);
    expect(out.every((e) => e.recurrenceId === "m1")).toBe(true);
    expect(out[0].start.getDate()).toBe(5);
    expect(out[3].start.getDate()).toBe(26);
    // occurrence duration preserved (30 min)
    expect(out[0].end.getTime() - out[0].start.getTime()).toBe(30 * 60000);
    expect((out[0].meta as { __recurring?: boolean }).__recurring).toBe(true);
  });

  it("keeps an all-day (local-midnight) weekly occurrence on the master's weekday", () => {
    // Master starts Fri Jan 2 2026 at local midnight and repeats every Friday.
    // rrule.js expands in UTC; feeding a local-midnight dtstart in a UTC+ zone
    // rolls the weekday back a day and shifts every occurrence forward by one
    // unless expansion happens in a UTC-naive frame.
    const allDayMaster = master({
      start: new Date(2026, 0, 2, 0, 0),
      end: new Date(2026, 0, 3, 0, 0),
      allDay: true,
      recurrence: "FREQ=WEEKLY;BYDAY=FR;COUNT=4",
    });
    const out = expandEvents([allDayMaster], win).sort((a, b) => a.start.getTime() - b.start.getTime());
    // Fridays in Jan 2026: 2, 9, 16, 23 (COUNT=4)
    expect(out.map((e) => e.start.getDate())).toEqual([2, 9, 16, 23]);
    expect(out.every((e) => e.start.getDay() === 5)).toBe(true); // 5 = Friday
    expect(out.every((e) => e.start.getHours() === 0)).toBe(true);
  });

  it("preserves a multi-day span for every occurrence of a weekly all-day series", () => {
    const multiDay = master({
      start: new Date(2026, 0, 2, 0, 0),
      end: new Date(2026, 0, 5, 0, 0), // 3-day all-day span (Fri->Sun)
      allDay: true,
      recurrence: "FREQ=WEEKLY;BYDAY=FR;COUNT=4",
    });
    const out = expandEvents([multiDay], win);
    expect(out).toHaveLength(4);
    expect(out.every((e) => e.end.getTime() - e.start.getTime() === 3 * 86_400_000)).toBe(true);
    expect(out.every((e) => e.start.getDay() === 5)).toBe(true);
  });

  it("skips exceptionDates", () => {
    const out = expandEvents([master({ exceptionDates: [new Date(2026, 0, 12, 9, 0)] })], win);
    expect(out).toHaveLength(3);
    expect(out.some((e) => e.start.getDate() === 12)).toBe(false);
  });

  it("replaces an occurrence with its override event", () => {
    const override: ISchedulerEvent = {
      id: "o1",
      title: "Standup (moved)",
      start: new Date(2026, 0, 19, 14, 0),
      end: new Date(2026, 0, 19, 14, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 0, 19, 9, 0),
    };
    const out = expandEvents([master(), override], win);
    expect(out).toHaveLength(4);
    const moved = out.find((e) => e.id === "o1");
    expect(moved?.start.getHours()).toBe(14);
    expect(moved?.title).toBe("Standup (moved)");
    // the synthesized 9:00 occurrence for Jan 19 must NOT also appear
    expect(out.filter((e) => e.start.getDate() === 19)).toHaveLength(1);
  });

  it("passes non-recurring events through unchanged", () => {
    const plain: ISchedulerEvent = {
      id: "p",
      title: "One-off",
      start: new Date(2026, 0, 8),
      end: new Date(2026, 0, 9),
    };
    const out = expandEvents([plain], win);
    expect(out).toEqual([plain]);
  });

  it("uses a stable occurrenceId", () => {
    const out = expandEvents([master()], win);
    expect(out[0].id).toBe(`m1::${out[0].originalStart!.toISOString()}`);
  });

  it("does not mutate input master/override events", () => {
    const m = master();
    const override: ISchedulerEvent = {
      id: "o1",
      title: "Standup (moved)",
      start: new Date(2026, 0, 19, 14, 0),
      end: new Date(2026, 0, 19, 14, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 0, 19, 9, 0),
    };
    const mSnapshot = JSON.parse(JSON.stringify(m));
    const oSnapshot = JSON.parse(JSON.stringify(override));
    expandEvents([m, override], win);
    expect(JSON.parse(JSON.stringify(m))).toEqual(mSnapshot);
    expect(JSON.parse(JSON.stringify(override))).toEqual(oSnapshot);
  });

  it("bounded series (COUNT) does not over-expand when the window extends past series end", () => {
    const wideWindow = { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31, 23, 59) };
    const out = expandEvents([master()], wideWindow);
    expect(out).toHaveLength(4);
    expect(out[3].start.getDate()).toBe(26);
    expect(out[3].start.getMonth()).toBe(0);
  });

  it("bounded series (UNTIL) includes the boundary occurrence and stops there, in-window", () => {
    const untilInstant = new Date(2026, 0, 10, 9, 0);
    const untilStamp = untilInstant.toISOString().replace(/[-:]|\.\d+/g, "");
    const boundedMaster: ISchedulerEvent = {
      id: "m2",
      title: "Daily standup",
      start: new Date(2026, 0, 1, 9, 0),
      end: new Date(2026, 0, 1, 9, 15),
      recurrence: `FREQ=DAILY;UNTIL=${untilStamp}`,
    };
    const out = expandEvents([boundedMaster], win);
    // Daily Jan 1..10 inclusive = 10 occurrences; the UNTIL boundary occurrence (Jan 10) must be
    // included and no occurrence past it must be synthesized.
    expect(out).toHaveLength(10);
    expect(out[out.length - 1].start.getDate()).toBe(10);
    expect(out.every((e) => e.start.getDate() <= 10)).toBe(true);
  });

  it("emits an in-window override even when the master has no occurrence in the window", () => {
    // Master's own COUNT=4 series ends in early January (Jan 5, 12, 19, 26), well before this
    // window. The override for one of those masterless dates was moved into February; its own
    // displayed time overlaps the window even though rule.between() yields nothing there.
    const boundedMaster = master({ recurrence: "FREQ=WEEKLY;BYDAY=MO;COUNT=4" });
    const override: ISchedulerEvent = {
      id: "o-moved",
      title: "Standup (moved into Feb)",
      start: new Date(2026, 1, 10, 9, 0),
      end: new Date(2026, 1, 10, 9, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 0, 19, 9, 0),
    };
    const febWindow = { start: new Date(2026, 1, 1), end: new Date(2026, 1, 28, 23, 59) };
    const out = expandEvents([boundedMaster, override], febWindow);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("o-moved");
  });

  it("after-loop pass skips an override whose originalStart is in the master's exceptionDates", () => {
    // The master's own COUNT=4 series ends in January, well before this window, so only the
    // after-loop (masterless-override) pass would ever emit this override. Its originalStart is
    // also listed as an exception on the master -- e.g. a non-atomic "delete this occurrence"
    // that removed the occurrence but left a stale override lying around. It must not resurrect.
    const originalStart = new Date(2026, 0, 19, 9, 0);
    const boundedMaster = master({ exceptionDates: [originalStart] });
    const override: ISchedulerEvent = {
      id: "o-deleted",
      title: "Standup (should stay deleted)",
      start: new Date(2026, 1, 10, 9, 0),
      end: new Date(2026, 1, 10, 9, 30),
      recurrenceId: "m1",
      originalStart,
    };
    const febWindow = { start: new Date(2026, 1, 1), end: new Date(2026, 1, 28, 23, 59) };
    const out = expandEvents([boundedMaster, override], febWindow);
    expect(out).toHaveLength(0);
  });

  it("does not double-emit an override whose master occurrence is in-window", () => {
    const override: ISchedulerEvent = {
      id: "o1",
      title: "Standup (moved)",
      start: new Date(2026, 0, 19, 14, 0),
      end: new Date(2026, 0, 19, 14, 30),
      recurrenceId: "m1",
      originalStart: new Date(2026, 0, 19, 9, 0),
    };
    const out = expandEvents([master(), override], win);
    const jan19Events = out.filter((e) => e.start.getDate() === 19 && e.start.getMonth() === 0);
    expect(jan19Events).toHaveLength(1);
    expect(jan19Events[0].id).toBe("o1");
  });
});
