import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerAgendaView from "./SchedulerAgendaView.vue";
import type { ISchedulerEvent } from "../../types";

const t = { $t: (k: string) => k };

const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show" class="vc-popover-stub"><slot name="header"/><slot/><slot name="footer"/></div>`,
};

const events: ISchedulerEvent[] = [
  { id: "a", title: "Summer Sale", start: new Date(2026, 6, 3, 9, 0), end: new Date(2026, 6, 3, 10, 0) },
  { id: "b", title: "Flash Deal", start: new Date(2026, 6, 8, 9, 0), end: new Date(2026, 6, 8, 10, 0) },
  // Different month — must be excluded from the July agenda.
  { id: "c", title: "Elsewhere", start: new Date(2026, 7, 2, 9, 0), end: new Date(2026, 7, 2, 10, 0) },
];

function mountView(over = {}) {
  return mount(SchedulerAgendaView, {
    props: {
      events,
      focusedDate: new Date(2026, 6, 15),
      editable: true,
      isEventEditable: () => true,
      quickInfo: false,
      ...over,
    },
    global: { mocks: t, stubs: { VcPopover: VcPopoverStub, teleport: true } },
    attachTo: document.body,
  });
}

describe("SchedulerAgendaView", () => {
  it("lists only days of the focused month that have events", () => {
    const w = mountView();
    // July 3 and July 8 have events; August 2 is excluded.
    expect(w.findAll(".vc-scheduler__agenda-day")).toHaveLength(2);
    expect(w.findAll(".vc-scheduler__agenda-event")).toHaveLength(2);
    expect(w.text()).not.toContain("Elsewhere");
  });

  it("does not render its own create button (the shared toolbar owns create — no mobile duplicate)", () => {
    const w = mountView();
    expect(w.find("[data-test='agenda-new']").exists()).toBe(false);
    expect(w.find(".vc-scheduler__agenda-actions").exists()).toBe(false);
  });

  it("emits event-click when an event row is activated", async () => {
    const w = mountView();
    await w.find(".vc-scheduler__agenda-event").trigger("click");
    expect(w.emitted("event-click")).toBeTruthy();
  });

  it("renders an empty state when the month has no events", () => {
    const w = mountView({ events: [] });
    expect(w.find(".vc-scheduler__agenda-empty").exists()).toBe(true);
    expect(w.findAll(".vc-scheduler__agenda-day")).toHaveLength(0);
  });
});
