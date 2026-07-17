import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerMobileResourceCard from "@ui/components/organisms/vc-scheduler/_internal/mobile/SchedulerMobileResourceCard.vue";

const resource = { id: "r1", label: "Promo A" };
const bars = [
  { id: "a", resourceId: "r1", start: new Date("2026-01-01"), end: new Date("2026-01-05"), label: "Sale" },
  { id: "b", resourceId: "r1", start: new Date("2026-01-03"), end: new Date("2026-01-08"), label: "Flash" },
];

describe("SchedulerMobileResourceCard", () => {
  it("renders a period row + minibar per bar when expanded", () => {
    const wrapper = mount(SchedulerMobileResourceCard, {
      props: { resource, bars, expanded: true },
      global: { stubs: { VcButton: true } },
    });
    expect(wrapper.findAll(".vc-scheduler-mobile-card__period")).toHaveLength(2);
    expect(wrapper.findAll(".vc-scheduler-mobile-card__minibar")).toHaveLength(2);
  });

  it("emits bar-tap when a period is tapped", async () => {
    const wrapper = mount(SchedulerMobileResourceCard, {
      props: { resource, bars, expanded: true },
      global: { stubs: { VcButton: true } },
    });
    await wrapper.findAll(".vc-scheduler-mobile-card__period")[0].trigger("click");
    expect(wrapper.emitted("bar-tap")![0][0]).toMatchObject({ id: "a" });
  });
});
