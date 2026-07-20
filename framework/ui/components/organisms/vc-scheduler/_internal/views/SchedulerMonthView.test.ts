import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerMonthView from "@ui/components/organisms/vc-scheduler/_internal/views/SchedulerMonthView.vue";

const events = [
  {
    id: "a",
    title: "Sale",
    start: new Date("2026-07-06T00:00:00Z"),
    end: new Date("2026-07-09T00:00:00Z"),
    allDay: true,
  },
];

// Stub VcPopover (used by MonthEventPopover) so its teleported content renders inline for assertions.
const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show" class="vc-popover-stub"><slot name="header"/><slot/><slot name="footer"/></div>`,
};

function mountView(over = {}) {
  return mount(SchedulerMonthView, {
    props: {
      events,
      focusedDate: new Date("2026-07-15T00:00:00Z"),
      firstDayOfWeek: 1,
      editable: true,
      isEventEditable: () => true,
      quickInfo: false,
      ...over,
    },
    global: {
      mocks: { $t: (k: string, p?: Record<string, unknown>) => (p?.count != null ? `+${p.count} more` : k) },
      stubs: { VcPopover: VcPopoverStub },
    },
  });
}

describe("SchedulerMonthView", () => {
  it("renders a weekday header (7) and 6 week rows", () => {
    const w = mountView();
    expect(w.findAll(".vc-scheduler__weekday")).toHaveLength(7);
    expect(w.findAllComponents({ name: "MonthWeekRow" })).toHaveLength(6);
  });

  it("renders the multi-day event as a bar", () => {
    const w = mountView();
    expect(w.findAllComponents({ name: "MonthEventBar" }).length).toBeGreaterThanOrEqual(1);
    expect(w.text()).toContain("Sale");
  });

  it("emits event-click when a bar is selected", async () => {
    const w = mountView();
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    expect(w.emitted("event-click")).toBeTruthy();
  });

  it("does not emit event-update on a plain click (no drag)", async () => {
    const w = mountView();
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    expect(w.emitted("event-update")).toBeFalsy();
  });

  it("does not open the quick-info popover when quickInfo is false", async () => {
    const w = mountView({ quickInfo: false });
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    expect(w.find(".vc-popover-stub").exists()).toBe(false);
  });

  it("opens the quick-info popover on bar select when quickInfo is true, still emitting event-click", async () => {
    const w = mountView({ quickInfo: true });
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    expect(w.emitted("event-click")).toBeTruthy();
    expect(w.find(".vc-popover-stub").exists()).toBe(true);
    expect(w.text()).toContain("Sale");
  });

  it('forwards the popover "Edit" click as edit-intent and closes the popover', async () => {
    const w = mountView({ quickInfo: true });
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    const editBtn = w.findAll("button").find((b) => b.text() === "VC_SCHEDULER.EDIT");
    expect(editBtn).toBeTruthy();
    await editBtn!.trigger("click");
    expect(w.emitted("edit-intent")![0]).toEqual([events[0]]);
    expect(w.emitted("event-edit")).toBeFalsy();
    expect(w.find(".vc-popover-stub").exists()).toBe(false);
  });

  it('forwards the popover "Delete" click as event-delete and closes the popover', async () => {
    const w = mountView({ quickInfo: true });
    await w.findComponent({ name: "MonthEventBar" }).vm.$emit("select");
    const deleteBtn = w.findAll("button").find((b) => b.text() === "VC_SCHEDULER.DELETE");
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger("click");
    expect(w.emitted("event-delete")![0]).toEqual([{ id: "a" }]);
    expect(w.find(".vc-popover-stub").exists()).toBe(false);
  });
});

describe("SchedulerMonthView — create-intent disambiguation", () => {
  it("never emits event-create", async () => {
    vi.useFakeTimers();
    const w = mountView();
    const cell = w.findAll(".vc-scheduler__day-cell")[10];
    await cell.trigger("pointerdown");
    window.dispatchEvent(new Event("pointerup"));
    vi.advanceTimersByTime(1000);
    expect(w.emitted("event-create")).toBeFalsy();
    vi.useRealTimers();
  });

  it("a lone click on an empty cell emits a single create-intent after the delay, not before", async () => {
    vi.useFakeTimers();
    const w = mountView();
    const cell = w.findAll(".vc-scheduler__day-cell")[10];
    await cell.trigger("pointerdown");
    window.dispatchEvent(new Event("pointerup"));

    expect(w.emitted("create-intent")).toBeFalsy();
    vi.advanceTimersByTime(220);

    const intents = w.emitted("create-intent");
    expect(intents).toHaveLength(1);
    expect(intents![0][0]).toMatchObject({ kind: "single", allDay: true });
    vi.useRealTimers();
  });

  it("two quick clicks on the same cell emit exactly one double create-intent, never a single", async () => {
    vi.useFakeTimers();
    const w = mountView();
    const cell = w.findAll(".vc-scheduler__day-cell")[10];

    await cell.trigger("pointerdown");
    window.dispatchEvent(new Event("pointerup"));
    vi.advanceTimersByTime(100); // well within the 220ms window
    await cell.trigger("pointerdown");
    window.dispatchEvent(new Event("pointerup"));
    vi.advanceTimersByTime(1000);

    const intents = w.emitted("create-intent") ?? [];
    expect(intents).toHaveLength(1);
    expect(intents[0][0]).toMatchObject({ kind: "double" });
    vi.useRealTimers();
  });

  describe("dragging across cells", () => {
    beforeEach(() => {
      // jsdom has no layout; give the grid/cells a real box so dayFromPoint can resolve
      // a different day under the pointer (col = 7 equal bands across the mocked width).
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: 700,
        height: 600,
        top: 0,
        left: 0,
        right: 700,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("emits a drag create-intent on pointer-up immediately, and never a single afterwards", async () => {
      vi.useFakeTimers();
      const w = mountView();
      const cell = w.findAll(".vc-scheduler__day-cell")[0];
      await cell.trigger("pointerdown", { clientX: 10, clientY: 10 });
      const move = new Event("pointermove");
      Object.assign(move, { clientX: 650, clientY: 10 }); // a different day column
      window.dispatchEvent(move);
      window.dispatchEvent(new Event("pointerup"));

      const intents = w.emitted("create-intent") ?? [];
      expect(intents).toHaveLength(1);
      expect(intents[0][0]).toMatchObject({ kind: "drag", allDay: true });

      vi.advanceTimersByTime(1000);
      expect(w.emitted("create-intent")).toHaveLength(1);
      vi.useRealTimers();
    });
  });
});
