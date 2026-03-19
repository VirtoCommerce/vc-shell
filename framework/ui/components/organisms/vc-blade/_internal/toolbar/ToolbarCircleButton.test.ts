import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("../../../../", () => ({
  VcIcon: {
    name: "VcIcon",
    props: ["icon", "size"],
    template: "<i class='vc-icon-stub' />",
  },
}));

import ToolbarCircleButton from "./ToolbarCircleButton.vue";

function mountButton(props: Record<string, unknown> = {}) {
  return mount(ToolbarCircleButton as any, {
    props: {
      icon: "lucide-plus",
      title: "Create",
      ...props,
    },
    global: {
      stubs: {
        ToolbarBaseButton: {
          name: "ToolbarBaseButton",
          props: ["contentDirection", "iconClassName", "titleClassName", "showTitle"],
          template:
            '<button class="toolbar-base-button-stub" :data-direction="contentDirection" :data-icon-class="iconClassName" :data-title-class="titleClassName"><slot /></button>',
        },
      },
    },
  });
}

describe("ToolbarCircleButton", () => {
  it("renders root element with correct class", () => {
    const wrapper = mountButton();
    expect(wrapper.find(".vc-blade-toolbar-circle-button").exists()).toBe(true);
  });

  it("applies main modifier class when isMain is true", () => {
    const wrapper = mountButton({ isMain: true });
    expect(wrapper.find(".vc-blade-toolbar-circle-button--main").exists()).toBe(true);
  });

  it("does not apply main class by default", () => {
    const wrapper = mountButton();
    expect(wrapper.find(".vc-blade-toolbar-circle-button--main").exists()).toBe(false);
  });

  it("applies mobile modifier class when isMobile is true", () => {
    const wrapper = mountButton({ isMobile: true });
    expect(wrapper.find(".vc-blade-toolbar-circle-button--mobile").exists()).toBe(true);
  });

  it("applies expanded modifier class when isExpanded is true", () => {
    const wrapper = mountButton({ isExpanded: true });
    expect(wrapper.find(".vc-blade-toolbar-circle-button--expanded").exists()).toBe(true);
  });

  it("sets contentDirection to row when mobile+main and not expanded", () => {
    const wrapper = mountButton({ isMobile: true, isMain: true, isExpanded: false });
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-direction")).toBe("row");
  });

  it("sets contentDirection to row-reverse by default", () => {
    const wrapper = mountButton();
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-direction")).toBe("row-reverse");
  });

  it("sets contentDirection to row-reverse when expanded", () => {
    const wrapper = mountButton({ isMobile: true, isMain: true, isExpanded: true });
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-direction")).toBe("row-reverse");
  });

  it("includes main icon class when isMain is true", () => {
    const wrapper = mountButton({ isMain: true });
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-icon-class")).toContain("vc-blade-toolbar-circle-button__icon--main");
  });

  it("includes expanded icon class when isExpanded is true", () => {
    const wrapper = mountButton({ isExpanded: true });
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-icon-class")).toContain("vc-blade-toolbar-circle-button__icon--main-expanded");
  });

  it("includes main title class when isMain is true", () => {
    const wrapper = mountButton({ isMain: true });
    const stub = wrapper.find(".toolbar-base-button-stub");
    expect(stub.attributes("data-title-class")).toContain("vc-blade-toolbar-circle-button__title--main");
  });
});
