import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MonthMorePopover from "./MonthMorePopover.vue";
import type { ISchedulerEvent } from "../../types";

const VcPopoverStub = {
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  template: `<div v-if="show" class="vc-popover-stub"><slot/></div>`,
};

const events: ISchedulerEvent[] = [
  { id: "a", title: "Summer Sale", start: new Date(2026, 6, 1), end: new Date(2026, 6, 6), allDay: true },
  { id: "b", title: "Flash Deal", start: new Date(2026, 6, 3), end: new Date(2026, 6, 4), allDay: true },
];

function mountMore() {
  return mount(MonthMorePopover, {
    props: { open: true, date: new Date(2026, 6, 1), events, anchorRect: null },
    global: { stubs: { VcPopover: VcPopoverStub } },
  });
}

describe("MonthMorePopover", () => {
  it("lists the overflow events", () => {
    const w = mountMore();
    expect(w.findAll("li")).toHaveLength(2);
    expect(w.text()).toContain("Summer Sale");
    expect(w.text()).toContain("Flash Deal");
  });

  // This popover is the only route to the 4th+ event on a day, so each row must be a real
  // control — as StaticText the events were unreachable by keyboard and screen reader
  // (WCAG 2.1.1 / 4.1.2, VCST-5671). axe cannot catch this: a click handler on a plain <li>
  // reports no violation.
  it("renders each overflow event as a button so it is keyboard operable", () => {
    const w = mountMore();
    const buttons = w.findAll("li button");
    expect(buttons).toHaveLength(2);
    expect(buttons.map((b) => b.attributes("type"))).toEqual(["button", "button"]);
    expect(buttons[0].text()).toContain("Summer Sale");
  });

  it("emits event-click with the event and an anchor rect when a row is clicked", async () => {
    const w = mountMore();
    await w.findAll("li button")[1].trigger("click");
    const ev = w.emitted("event-click");
    expect(ev).toBeTruthy();
    expect((ev![0][0] as ISchedulerEvent).id).toBe("b");
    // Second arg is the clicked row's bounding rect (used to anchor the quick-info popover).
    // jsdom returns a plain rect-shaped object rather than a DOMRect instance.
    const rect = ev![0][1] as DOMRect;
    expect(rect).toBeTruthy();
    expect(typeof rect.top).toBe("number");
    expect(typeof rect.width).toBe("number");
  });
});
