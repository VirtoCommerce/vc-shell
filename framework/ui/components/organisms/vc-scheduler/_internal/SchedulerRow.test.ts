import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerRow from "@ui/components/organisms/vc-scheduler/_internal/SchedulerRow.vue";

describe("SchedulerRow", () => {
  const props = {
    packedBars: [
      { id: "a", resourceId: "r1", start: new Date("2026-01-01"), end: new Date("2026-01-03"), lane: 0, label: "A" },
      { id: "b", resourceId: "r1", start: new Date("2026-01-02"), end: new Date("2026-01-05"), lane: 1, label: "B" },
    ],
    dateToX: (d: Date) => ((d.getTime() - new Date("2026-01-01").getTime()) / 86_400_000) * 48,
    laneHeight: 28,
    laneGap: 4,
    height: 60,
    editable: true,
    selectedId: null as string | null,
  };

  it("renders one bar per packed bar, positioned by lane", () => {
    const wrapper = mount(SchedulerRow, { props });
    const bars = wrapper.findAllComponents({ name: "SchedulerBar" });
    expect(bars).toHaveLength(2);
  });

  it("re-emits bar-select with the bar id", async () => {
    const wrapper = mount(SchedulerRow, { props });
    await wrapper.findAllComponents({ name: "SchedulerBar" })[0].vm.$emit("select");
    expect(wrapper.emitted("bar-select")![0][0]).toBe("a");
  });
});
