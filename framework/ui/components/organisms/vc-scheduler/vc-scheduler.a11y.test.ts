import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import axe from "axe-core";
import VcScheduler from "@ui/components/organisms/vc-scheduler/VcScheduler.vue";

describe("VcScheduler a11y", () => {
  it("has no axe violations in the default Month view", async () => {
    const wrapper = mount(VcScheduler, {
      attachTo: document.body,
      props: {
        events: [
          {
            id: "a",
            title: "Sale",
            start: new Date("2026-01-01T00:00:00Z"),
            end: new Date("2026-01-05T00:00:00Z"),
            allDay: true,
          },
        ],
        editable: true,
      },
    });
    const results = await axe.run(wrapper.element as HTMLElement);
    expect(results).toHaveNoViolations();
    wrapper.unmount();
  });
});
