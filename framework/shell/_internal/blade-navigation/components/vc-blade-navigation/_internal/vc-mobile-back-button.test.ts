import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import VcMobileBackButton from "./vc-mobile-back-button.vue";

vi.mock("@vueuse/core", () => ({
  onLongPress: vi.fn(),
}));

vi.mock("@vueuse/components", () => ({
  OnLongPress: defineComponent({
    name: "OnLongPress",
    props: ["as"],
    setup(props, { slots }) {
      return () => h(props.as ?? "div", { class: "mock-long-press" }, slots.default?.());
    },
  }),
  vOnClickOutside: {},
}));

vi.mock("@ui/components/atoms/vc-button", () => ({
  VcButton: defineComponent({
    name: "VcButton",
    props: ["icon", "iconClass", "iconSize", "text"],
    emits: ["click"],
    setup(_, { emit, attrs }) {
      return () => h("button", { ...attrs, class: "mock-vc-button", onClick: () => emit("click") });
    },
  }),
}));

vi.mock("@ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue", () => ({
  default: defineComponent({
    name: "VcBreadcrumbs",
    props: ["items", "collapsed"],
    setup(_, { slots }) {
      return () => h("div", { class: "mock-breadcrumbs" }, [slots.trigger?.({ click: () => {} }), slots.default?.()]);
    },
  }),
}));

describe("vc-mobile-back-button.vue", () => {
  const breadcrumbs = [
    { title: "Home", id: "home" },
    { title: "Products", id: "products" },
  ];

  it("is one named button, not a button inside a button", () => {
    const wrapper = mount(VcMobileBackButton, {
      props: { breadcrumbs, onBack: vi.fn() },
    });
    expect(wrapper.findAll("button")).toHaveLength(1);
    expect(wrapper.find("button button").exists()).toBe(false);
    expect(wrapper.find("button").attributes("aria-label")).toBe("COMPONENTS.MOLECULES.VC_BREADCRUMBS.BACK");
  });

  it("renders the back button", () => {
    const wrapper = mount(VcMobileBackButton, {
      props: { breadcrumbs, onBack: vi.fn() },
    });
    expect(wrapper.find(".mock-vc-button").exists()).toBe(true);
  });

  it("calls onBack when button is clicked", async () => {
    const onBack = vi.fn();
    const wrapper = mount(VcMobileBackButton, {
      props: { breadcrumbs, onBack },
    });
    await wrapper.find(".mock-vc-button").trigger("click");
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders breadcrumbs component with items", () => {
    const wrapper = mount(VcMobileBackButton, {
      props: { breadcrumbs, onBack: vi.fn() },
    });
    expect(wrapper.find(".mock-breadcrumbs").exists()).toBe(true);
  });
});
