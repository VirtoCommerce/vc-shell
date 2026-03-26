import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { IsMobileKey } from "@framework/injection-keys";
import BladeToolbarSkeleton from "./BladeToolbarSkeleton.vue";

vi.mock("@ui/components/atoms/vc-skeleton", () => ({
  VcSkeleton: defineComponent({
    name: "VcSkeleton",
    props: ["variant", "width", "height"],
    setup() {
      return () => h("div", { class: "mock-skeleton" });
    },
  }),
}));

describe("BladeToolbarSkeleton.vue", () => {
  it("renders the root element with toolbar class", () => {
    const wrapper = mount(BladeToolbarSkeleton, {
      global: {
        provide: {
          [IsMobileKey as symbol]: ref(false),
        },
      },
    });
    expect(wrapper.find(".vc-blade-toolbar-skeleton").exists()).toBe(true);
  });

  it("renders 3 skeleton button placeholders", () => {
    const wrapper = mount(BladeToolbarSkeleton, {
      global: {
        provide: {
          [IsMobileKey as symbol]: ref(false),
        },
      },
    });
    const skeletons = wrapper.findAll(".mock-skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("has mobile class when $isMobile is true", () => {
    const wrapper = mount(BladeToolbarSkeleton, {
      global: {
        provide: {
          [IsMobileKey as symbol]: ref(true),
        },
      },
    });
    expect(wrapper.find(".vc-blade-toolbar--mobile").exists()).toBe(true);
  });
});
