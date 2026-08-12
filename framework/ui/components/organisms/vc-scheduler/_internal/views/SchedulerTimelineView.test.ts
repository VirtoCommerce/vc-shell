import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerTimelineView from "./SchedulerTimelineView.vue";
import type { ISchedulerEvent } from "../../types";

const t = { $t: (k: string) => k };

const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show" class="vc-popover-stub"><slot name="header"/><slot/><slot name="footer"/></div>`,
};

// Focused day: 2021-01-13 (Wed). Timed events on that day.
const events: ISchedulerEvent[] = [
  { id: "a", title: "Standup", start: new Date(2021, 0, 13, 9, 0), end: new Date(2021, 0, 13, 10, 0) },
  { id: "b", title: "Review", start: new Date(2021, 0, 13, 14, 0), end: new Date(2021, 0, 13, 16, 0) },
  // Off-window event on a different day — must be filtered out in Day mode.
  { id: "c", title: "Elsewhere", start: new Date(2021, 0, 20, 9, 0), end: new Date(2021, 0, 20, 10, 0) },
];

function mountView(over = {}) {
  return mount(SchedulerTimelineView, {
    props: {
      events,
      focusedDate: new Date(2021, 0, 13),
      firstDayOfWeek: 1,
      editable: true,
      isEventEditable: () => true,
      quickInfo: false,
      mode: "day",
      ...over,
    },
    global: { mocks: t, stubs: { VcPopover: VcPopoverStub } },
    attachTo: document.body,
  });
}

describe("SchedulerTimelineView (vertical time grid)", () => {
  it("day mode: renders 24 hour labels and one day header cell", () => {
    const w = mountView();
    expect(w.findAll(".vc-scheduler__tg-hour-label").length).toBe(24);
    expect(w.findAll(".vc-scheduler__tg-head-col").length).toBe(1);
  });

  it("day mode: renders only in-window events as timed blocks", () => {
    const w = mountView();
    // "Elsewhere" (Jan 20) is filtered out; 2 timed blocks remain.
    expect(w.findAll(".vc-scheduler__tg-event").length).toBe(2);
  });

  it("week mode: renders 7 day header cells", () => {
    const w = mountView({ mode: "week" });
    expect(w.findAll(".vc-scheduler__tg-head-col").length).toBe(7);
  });

  it("week mode: shades weekend day columns (Sat+Sun)", () => {
    // Focused week Mon Jan 11 – Sun Jan 17, 2021 (firstDayOfWeek=1) contains Sat 16 + Sun 17.
    const w = mountView({ mode: "week" });
    expect(w.findAll(".vc-scheduler__tg-col--weekend").length).toBe(2);
  });

  it("day mode: does not shade the today column for a non-today focused date", () => {
    const w = mountView();
    expect(w.findAll(".vc-scheduler__tg-col--today").length).toBe(0);
  });

  it("trimmed window renders fewer hour labels", () => {
    const w = mountView({ dayStartHour: 8, dayEndHour: 20 });
    expect(w.findAll(".vc-scheduler__tg-hour-label").length).toBe(12);
  });

  it("routes an all-day event to the all-day strip, not the time grid", () => {
    const w = mountView({
      events: [{ id: "ad", title: "Promo", start: new Date(2021, 0, 13), end: new Date(2021, 0, 14), allDay: true }],
    });
    expect(w.findAll(".vc-scheduler__tg-allday-bar").length).toBe(1);
    expect(w.findAll(".vc-scheduler__tg-event").length).toBe(0);
  });

  // An all-day end is exclusive, so labelling it raw put the event a day past where it runs and
  // added a meaningless 12:00 AM. Timed events must keep their times (VCST-5678).
  it("announces a one-day all-day event as a single date, with no time", () => {
    const w = mountView({
      events: [{ id: "ad", title: "Promo", start: new Date(2021, 0, 13), end: new Date(2021, 0, 14), allDay: true }],
    });
    const label = w.get(".vc-scheduler__tg-allday-bar").attributes("aria-label");
    expect(label).toBe("Promo: Jan 13, 2021");
  });

  it("keeps start and end times in a timed event's label", () => {
    const w = mountView();
    const label = w.get(".vc-scheduler__tg-event").attributes("aria-label");
    expect(label).toContain("Standup");
    expect(label).toContain("9:00 AM");
    expect(label).toContain("10:00 AM");
  });
});

describe("SchedulerTimelineView — create/edit intents", () => {
  beforeEach(() => {
    // jsdom has no layout; give every element a real box so onColumnClick can map clientY→hour.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 1152,
      top: 0,
      left: 0,
      right: 200,
      bottom: 1152,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never emits event-create or event-edit", async () => {
    vi.useFakeTimers();
    const w = mountView({ quickInfo: true });
    await w.findAll(".vc-scheduler__tg-col")[0].trigger("click", { clientX: 20, clientY: 480 });
    vi.advanceTimersByTime(1000);
    expect(w.emitted("event-create")).toBeFalsy();
    expect(w.emitted("event-edit")).toBeFalsy();
    vi.useRealTimers();
  });

  it("a lone click on an empty slot emits a single create-intent with a 1-hour timed range after the delay", async () => {
    vi.useFakeTimers();
    const w = mountView();
    await w.findAll(".vc-scheduler__tg-col")[0].trigger("click", { clientX: 20, clientY: 480 });

    expect(w.emitted("create-intent")).toBeFalsy();
    vi.advanceTimersByTime(220);

    const intents = w.emitted("create-intent");
    expect(intents).toHaveLength(1);
    const intent = intents![0][0] as { start: Date; end: Date; allDay: boolean; kind: string };
    expect(intent.kind).toBe("single");
    expect(intent.allDay).toBe(false);
    expect(intent.end.getTime() - intent.start.getTime()).toBe(60 * 60 * 1000);
    vi.useRealTimers();
  });

  it("two quick clicks on the same slot emit exactly one double create-intent, never a single", async () => {
    vi.useFakeTimers();
    const w = mountView();
    const col = w.findAll(".vc-scheduler__tg-col")[0];

    await col.trigger("click", { clientX: 20, clientY: 480 });
    vi.advanceTimersByTime(100); // well within the 220ms window
    await col.trigger("click", { clientX: 20, clientY: 480 });
    vi.advanceTimersByTime(1000);

    const intents = w.emitted("create-intent") ?? [];
    expect(intents).toHaveLength(1);
    expect((intents[0][0] as { kind: string }).kind).toBe("double");
    vi.useRealTimers();
  });

  it("clicking an existing event block does not emit create-intent", async () => {
    vi.useFakeTimers();
    const w = mountView();
    await w.findAll(".vc-scheduler__tg-event")[0].trigger("click");
    vi.advanceTimersByTime(1000);
    expect(w.emitted("create-intent")).toBeFalsy();
    vi.useRealTimers();
  });

  it('forwards the quick-info popover "Edit" click as edit-intent', async () => {
    const w = mountView({ quickInfo: true });
    await w.findAll(".vc-scheduler__tg-event")[0].trigger("click");
    const editBtn = w.findAll("button").find((b) => b.text() === "VC_SCHEDULER.EDIT");
    expect(editBtn).toBeTruthy();
    await editBtn!.trigger("click");
    expect(w.emitted("edit-intent")![0]).toEqual([events[0]]);
    expect(w.emitted("event-edit")).toBeFalsy();
  });
});
