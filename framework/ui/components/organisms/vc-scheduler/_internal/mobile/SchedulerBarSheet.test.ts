import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerBarSheet from "@ui/components/organisms/vc-scheduler/_internal/mobile/SchedulerBarSheet.vue";

const bar = { id: "a", resourceId: "r1", start: new Date("2026-01-01"), end: new Date("2026-01-05"), label: "Sale" };

describe("SchedulerBarSheet", () => {
  it("renders the bar label when open", () => {
    const wrapper = mount(SchedulerBarSheet, {
      props: { modelBar: bar, open: true },
      global: { stubs: { VcDatePicker: true, VcButton: true } },
    });
    expect(wrapper.text()).toContain("Sale");
  });

  it("emits save with the edited range", async () => {
    const wrapper = mount(SchedulerBarSheet, {
      props: { modelBar: bar, open: true },
      global: {
        stubs: { VcDatePicker: true, VcButton: { template: "<button @click=\"$emit('click')\"><slot/></button>" } },
      },
    });
    await wrapper.get('[data-test="save"]').trigger("click");
    const evt = wrapper.emitted("save")![0][0] as { id: string };
    expect(evt.id).toBe("a");
  });
});
