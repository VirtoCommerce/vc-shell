import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import BladeHeaderSkeleton from "./BladeHeaderSkeleton.vue";

vi.mock("@ui/components/atoms/vc-skeleton", () => ({
  VcSkeleton: defineComponent({
    name: "VcSkeleton",
    props: ["variant", "width", "height"],
    setup(props) {
      return () => h("div", { class: "mock-skeleton", "data-variant": props.variant });
    },
  }),
}));

describe("BladeHeaderSkeleton.vue", () => {
  it("renders the root element", () => {
    const wrapper = mount(BladeHeaderSkeleton);
    expect(wrapper.find(".vc-blade-header-skeleton").exists()).toBe(true);
  });

  it("renders icon placeholder with circle variant", () => {
    const wrapper = mount(BladeHeaderSkeleton);
    const icon = wrapper.find(".vc-blade-header-skeleton__icon .mock-skeleton");
    expect(icon.exists()).toBe(true);
    expect(icon.attributes("data-variant")).toBe("circle");
  });

  it("renders text section with title and subtitle skeletons", () => {
    const wrapper = mount(BladeHeaderSkeleton);
    const textSection = wrapper.find(".vc-blade-header-skeleton__text");
    expect(textSection.exists()).toBe(true);
    // Title + subtitle = 2 block skeletons in text section
    const blockSkeletons = textSection.findAll(".mock-skeleton");
    expect(blockSkeletons.length).toBe(2);
  });
});
