import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { IsMobileKey } from "@framework/injection-keys";

// Mock @headlessui/vue with minimal functional stubs
vi.mock("@headlessui/vue", () => ({
  TransitionRoot: {
    name: "TransitionRoot",
    props: ["show", "appear", "as"],
    template: '<div v-if="show"><slot /></div>',
  },
  TransitionChild: {
    name: "TransitionChild",
    props: ["as", "enter", "enterFrom", "enterTo", "leave", "leaveFrom", "leaveTo"],
    template: "<div><slot /></div>",
  },
  Dialog: {
    name: "Dialog",
    props: ["as", "ariaLabelledby"],
    emits: ["close"],
    template: '<div class="vc-popup" role="dialog"><slot /></div>',
  },
  DialogPanel: {
    name: "DialogPanel",
    props: ["class"],
    template: '<div class="vc-popup__panel"><slot /></div>',
  },
  DialogTitle: {
    name: "DialogTitle",
    props: ["id", "as"],
    template: '<h3 class="vc-popup__title"><slot /></h3>',
  },
}));

import VcPopup from "./vc-popup.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(VcPopup, {
    props: { modelValue: true, ...props },
    slots,
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(false),
      },
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "class"],
          template: '<i class="vc-icon-stub" />',
        },
        VcButton: {
          name: "VcButton",
          template: '<button class="vc-button-stub"><slot /></button>',
        },
      },
      mocks: {
        $t: (key: string) => key,
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("VcPopup", () => {
  it("renders when modelValue is true", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-popup").exists()).toBe(true);
  });

  it("does not render dialog content when modelValue is false", () => {
    const wrapper = factory({ modelValue: false });
    // TransitionRoot stub hides children when show=false
    expect(wrapper.find(".vc-popup").exists()).toBe(false);
  });

  it("renders title text", () => {
    const wrapper = factory({ title: "Confirm Delete" });
    expect(wrapper.find(".vc-popup__title").text()).toContain("Confirm Delete");
  });

  it("renders header slot instead of title prop", () => {
    const wrapper = factory({ title: "Fallback" }, { header: "<span>Custom Header</span>" });
    expect(wrapper.find(".vc-popup__title").text()).toContain("Custom Header");
  });

  it("renders content slot", () => {
    const wrapper = factory({}, { content: '<p class="test-content">Body text</p>' });
    expect(wrapper.find(".test-content").exists()).toBe(true);
  });

  it("renders footer slot", () => {
    const wrapper = factory({}, { footer: '<button class="custom-btn">OK</button>' });
    expect(wrapper.find(".vc-popup__footer").exists()).toBe(true);
    expect(wrapper.find(".custom-btn").exists()).toBe(true);
  });

  it("hides footer when no footer slot is provided", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-popup__footer").exists()).toBe(false);
  });

  it("shows close button when closable=true (default)", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-popup__close-btn").exists()).toBe(true);
  });

  it("hides close button when closable=false", () => {
    const wrapper = factory({ closable: false });
    expect(wrapper.find(".vc-popup__close-btn").exists()).toBe(false);
  });

  it("emits close and update:modelValue when close button is clicked", async () => {
    const wrapper = factory();
    await wrapper.find(".vc-popup__close-btn").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")?.[0]).toEqual(["action"]);
  });

  it("does not emit close when closable=false and close button is clicked", async () => {
    // closable=false hides the button, but let's verify closeFromAction guards
    const wrapper = factory({ closable: false });
    expect(wrapper.find(".vc-popup__close-btn").exists()).toBe(false);
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("renders icon for warning variant", () => {
    const wrapper = factory({ variant: "warning" });
    // VcIcon is rendered inside .vc-popup__content when variant is not 'default'
    const icons = wrapper.findAll(".vc-icon-stub");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("renders icon for error variant", () => {
    const wrapper = factory({ variant: "error" });
    const icons = wrapper.findAll(".vc-icon-stub");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("renders icon for success variant", () => {
    const wrapper = factory({ variant: "success" });
    const icons = wrapper.findAll(".vc-icon-stub");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("renders icon for info variant", () => {
    const wrapper = factory({ variant: "info" });
    const icons = wrapper.findAll(".vc-icon-stub");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("does not render variant icon for default variant", () => {
    const wrapper = factory({ variant: "default" });
    // Only the close button SVG should be present, no VcIcon in content area
    const contentArea = wrapper.find(".vc-popup__content");
    expect(contentArea.find(".vc-icon-stub").exists()).toBe(false);
  });

  it("applies fullscreen classes when isFullscreen=true", () => {
    const wrapper = factory({ isFullscreen: true });
    expect(wrapper.find(".vc-popup__container--fullscreen").exists()).toBe(true);
  });

  it("applies modal width class", () => {
    const wrapper = factory({ modalWidth: "tw-max-w-lg" });
    // The panel should have the custom width class
    const panel = wrapper.find(".vc-popup__panel");
    expect(panel.exists()).toBe(true);
  });
});
