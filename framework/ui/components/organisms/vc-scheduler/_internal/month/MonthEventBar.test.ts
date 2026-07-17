import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MonthEventBar from "@ui/components/organisms/vc-scheduler/_internal/month/MonthEventBar.vue";

const event = {
  id: "a",
  title: "Summer Sale",
  start: new Date("2026-07-01"),
  end: new Date("2026-07-05"),
  allDay: true,
  color: "var(--primary-500)",
};

describe("MonthEventBar", () => {
  it("renders title, role=button, aria-label with the title", () => {
    const w = mount(MonthEventBar, {
      props: { event, continuesLeft: false, continuesRight: false, selected: false, editable: true },
    });
    const el = w.get(".vc-scheduler__event-bar");
    expect(el.attributes("role")).toBe("button");
    expect(el.attributes("aria-label")).toContain("Summer Sale");
    expect(w.text()).toContain("Summer Sale");
  });
  it("emits select on click", async () => {
    const w = mount(MonthEventBar, {
      props: { event, continuesLeft: false, continuesRight: false, selected: false, editable: true },
    });
    await w.get(".vc-scheduler__event-bar").trigger("click");
    expect(w.emitted("select")).toBeTruthy();
  });
  it("hides resize handles when not editable", () => {
    const w = mount(MonthEventBar, {
      props: { event, continuesLeft: false, continuesRight: false, selected: false, editable: false },
    });
    expect(w.findAll(".vc-scheduler__event-bar-handle")).toHaveLength(0);
  });
  it("shows the recurrence marker for a recurring occurrence", () => {
    const w = mount(MonthEventBar, {
      props: {
        event: { ...event, recurrenceId: "a-2026-07-01" },
        continuesLeft: false,
        continuesRight: false,
        selected: false,
        editable: true,
      },
    });
    expect(w.find(".vc-scheduler__event-bar-recur").exists()).toBe(true);
  });
  it("hides the recurrence marker for a non-recurring event", () => {
    const w = mount(MonthEventBar, {
      props: { event, continuesLeft: false, continuesRight: false, selected: false, editable: true },
    });
    expect(w.find(".vc-scheduler__event-bar-recur").exists()).toBe(false);
  });
});
