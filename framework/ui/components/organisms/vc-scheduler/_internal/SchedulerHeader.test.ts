import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerHeader from "@ui/components/organisms/vc-scheduler/_internal/SchedulerHeader.vue";

describe("SchedulerHeader", () => {
  it("renders one fine tick element per fine tick", () => {
    const wrapper = mount(SchedulerHeader, {
      props: {
        fineTicks: [
          { date: new Date("2026-01-01"), x: 0 },
          { date: new Date("2026-01-02"), x: 48 },
        ],
        coarseTicks: [{ date: new Date("2026-01-01"), x: 0, label: "Jan 2026" }],
        zoom: "day",
        totalWidth: 96,
      },
    });
    expect(wrapper.findAll(".vc-scheduler__tick--fine")).toHaveLength(2);
    expect(wrapper.findAll(".vc-scheduler__tick--coarse")).toHaveLength(1);
    expect(wrapper.text()).toContain("Jan 2026");
  });
});
