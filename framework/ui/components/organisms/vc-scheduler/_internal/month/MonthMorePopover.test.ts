import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted } from "vue";
import MonthMorePopover from "./MonthMorePopover.vue";
import type { ISchedulerEvent } from "../../types";

const VcPopoverStub = defineComponent({
  name: "VcPopover",
  props: ["show", "anchorRef", "title", "placement", "contentScrollable"],
  emits: ["update:show"],
  setup(props, { attrs, emit, slots }) {
    const onKeydown = (event: KeyboardEvent) => {
      if (props.show && event.key === "Escape") emit("update:show", false);
    };
    onMounted(() => document.addEventListener("keydown", onKeydown));
    onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
    return () => (props.show ? h("div", { ...attrs, class: "vc-popover-stub" }, slots.default?.()) : null);
  },
});

const events: ISchedulerEvent[] = [
  { id: "a", title: "Summer Sale", start: new Date(2026, 6, 1), end: new Date(2026, 6, 6), allDay: true },
  { id: "b", title: "Flash Deal", start: new Date(2026, 6, 3), end: new Date(2026, 6, 4), allDay: true },
];

function mountMore() {
  return mount(MonthMorePopover, {
    props: { open: true, date: new Date(2026, 6, 1), events, anchorRect: null },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcPopover: VcPopoverStub },
    },
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

  it("moves focus into the popover when it is initially mounted open", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "+2 more";
    document.body.appendChild(trigger);
    trigger.focus();

    const w = mount(MonthMorePopover, {
      props: { open: true, date: new Date(2026, 6, 1), events, anchorRect: null },
      attachTo: document.body,
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { VcPopover: VcPopoverStub },
      },
    });
    try {
      await nextTick();
      expect(document.activeElement).toBe(w.find("li button").element);
    } finally {
      w.unmount();
      trigger.remove();
    }
  });

  it("exposes the overflow panel as a named dialog", () => {
    const w = mountMore();
    const panel = w.find('[role="dialog"]');

    expect(panel.exists()).toBe(true);
    expect(panel.attributes("aria-label")).toBe("VC_SCHEDULER.MORE_EVENTS");
  });

  it("returns focus to the +N more trigger when Escape closes the initially-open popover", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "+2 more";
    document.body.appendChild(trigger);
    trigger.focus();

    const w = mount(MonthMorePopover, {
      props: {
        open: true,
        date: new Date(2026, 6, 1),
        events,
        anchorRect: null,
        onClose: () => w.setProps({ open: false }),
      },
      attachTo: document.body,
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { VcPopover: VcPopoverStub },
      },
    });
    const escapedToWindow = vi.fn();
    window.addEventListener("keydown", escapedToWindow);
    try {
      await nextTick();
      const eventButton = w.find("li button").element as HTMLElement;
      eventButton.focus();

      const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      eventButton.dispatchEvent(escape);
      await nextTick();
      await nextTick();

      expect(escape.defaultPrevented).toBe(true);
      expect(escapedToWindow).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(trigger);
    } finally {
      window.removeEventListener("keydown", escapedToWindow);
      w.unmount();
      trigger.remove();
    }
  });
});
