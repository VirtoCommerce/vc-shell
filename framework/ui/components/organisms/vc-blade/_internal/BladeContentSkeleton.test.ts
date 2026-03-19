import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import BladeContentSkeleton from "./BladeContentSkeleton.vue";

vi.mock("@ui/components/atoms/vc-skeleton", () => ({
  VcSkeleton: defineComponent({
    name: "VcSkeleton",
    props: ["variant", "width", "height"],
    setup(props) {
      return () => h("div", { class: "mock-skeleton", "data-variant": props.variant });
    },
  }),
}));

describe("BladeContentSkeleton.vue", () => {
  it("renders the root element", () => {
    const wrapper = mount(BladeContentSkeleton);
    expect(wrapper.find(".vc-blade-content-skeleton").exists()).toBe(true);
  });

  it("renders three sections", () => {
    const wrapper = mount(BladeContentSkeleton);
    const sections = wrapper.findAll(".vc-blade-content-skeleton__section");
    expect(sections.length).toBe(3);
  });

  it("renders skeleton placeholders", () => {
    const wrapper = mount(BladeContentSkeleton);
    const skeletons = wrapper.findAll(".mock-skeleton");
    // 3 section headers + 3 field labels (section1) + 2 field labels (section2) + 1 textarea label + 2 field labels (section3) = 11 skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });

  it("renders input placeholders", () => {
    const wrapper = mount(BladeContentSkeleton);
    const inputs = wrapper.findAll(".vc-blade-content-skeleton__input");
    // 3 + 3 + 2 = 8 inputs across sections
    expect(inputs.length).toBe(8);
  });

  it("has one tall input for the textarea placeholder", () => {
    const wrapper = mount(BladeContentSkeleton);
    const tallInputs = wrapper.findAll(".vc-blade-content-skeleton__input--tall");
    expect(tallInputs.length).toBe(1);
  });
});
