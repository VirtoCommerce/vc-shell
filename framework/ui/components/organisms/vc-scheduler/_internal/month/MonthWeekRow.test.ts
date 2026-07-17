import { describe, it, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import MonthWeekRow from "@ui/components/organisms/vc-scheduler/_internal/month/MonthWeekRow.vue";

// Mock $t to handle the VC_SCHEDULER.MORE template with count substitution
config.global.mocks.$t = (key: string, params?: Record<string, unknown>) => {
  if (key === "VC_SCHEDULER.MORE" && params?.count) {
    return `+${params.count} more`;
  }
  return key;
};

const day = (d: string, inMonth = true) => ({ date: new Date(d), inMonth, isToday: false, isWeekend: false });
const days = ["2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"].map(
  (d) => day(d),
);
const seg = {
  event: { id: "a", title: "A", start: new Date("2026-07-01"), end: new Date("2026-07-03"), allDay: true },
  startCol: 2,
  endCol: 3,
  continuesLeft: false,
  continuesRight: false,
};

describe("MonthWeekRow", () => {
  it("renders 7 day cells and one event bar for the laid-out segment", () => {
    const w = mount(MonthWeekRow, {
      props: {
        days,
        laidOut: [{ segment: seg, lane: 0 }],
        overflow: new Array(7).fill(0),
        timedByDay: new Map(),
        selectedId: null,
        editable: true,
      },
    });
    expect(w.findAllComponents({ name: "MonthDayCell" })).toHaveLength(7);
    expect(w.findAllComponents({ name: "MonthEventBar" })).toHaveLength(1);
  });
  it("shows +N more when overflow>0 and emits more-click", async () => {
    const overflow = new Array(7).fill(0);
    overflow[2] = 2;
    const w = mount(MonthWeekRow, {
      props: { days, laidOut: [], overflow, timedByDay: new Map(), selectedId: null, editable: true },
    });
    const more = w.get(".vc-scheduler__more");
    expect(more.text()).toContain("2");
    await more.trigger("click");
    expect(w.emitted("more-click")).toBeTruthy();
  });
});
