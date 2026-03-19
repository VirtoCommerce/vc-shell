import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcPopupBase from "./vc-popup-base.vue";

// Stub VcPopup and VcButton
const VcPopupStub = {
  name: "VcPopup",
  template: `<div class="vc-popup-stub">
    <slot name="header" />
    <slot name="content" />
    <slot name="footer" :close="close" />
  </div>`,
  props: ["variant", "isMobileFullscreen", "title", "closable"],
  emits: ["close"],
  methods: {
    close() {
      this.$emit("close");
    },
  },
};

const VcButtonStub = {
  name: "VcButton",
  template: '<button class="vc-button-stub" @click="$emit(\'click\')"><slot /></button>',
  props: ["text"],
  emits: ["click"],
};

function mountPopupBase(props = {}, slots = {}) {
  return mount(VcPopupBase, {
    props,
    slots,
    global: {
      stubs: {
        VcPopup: VcPopupStub,
        VcButton: VcButtonStub,
      },
    },
  });
}

describe("VcPopupBase", () => {
  it("renders with default props", () => {
    const wrapper = mountPopupBase();
    expect(wrapper.find(".vc-popup-stub").exists()).toBe(true);
  });

  it("passes variant prop to VcPopup", () => {
    const wrapper = mountPopupBase({ variant: "info" });
    const popup = wrapper.findComponent(VcPopupStub);
    expect(popup.props("variant")).toBe("info");
  });

  it("passes title prop to VcPopup", () => {
    const wrapper = mountPopupBase({ title: "Test Title" });
    const popup = wrapper.findComponent(VcPopupStub);
    expect(popup.props("title")).toBe("Test Title");
  });

  it("passes closable prop to VcPopup (default true)", () => {
    const wrapper = mountPopupBase();
    const popup = wrapper.findComponent(VcPopupStub);
    expect(popup.props("closable")).toBe(true);
  });

  it("passes closable=false to VcPopup", () => {
    const wrapper = mountPopupBase({ closable: false });
    const popup = wrapper.findComponent(VcPopupStub);
    expect(popup.props("closable")).toBe(false);
  });

  it("passes isMobileFullscreen prop to VcPopup", () => {
    const wrapper = mountPopupBase({ isMobileFullscreen: false });
    const popup = wrapper.findComponent(VcPopupStub);
    expect(popup.props("isMobileFullscreen")).toBe(false);
  });

  it("emits close when VcPopup emits close", async () => {
    const wrapper = mountPopupBase();
    await wrapper.findComponent(VcPopupStub).vm.$emit("close");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("renders default slot content inside content slot", () => {
    const wrapper = mountPopupBase({}, { default: "Hello content" });
    expect(wrapper.text()).toContain("Hello content");
  });

  it("renders header slot when provided", () => {
    const wrapper = mountPopupBase({}, { header: "<span>Custom Header</span>" });
    expect(wrapper.text()).toContain("Custom Header");
  });

  it("shows single acknowledge button in acknowledge mode", () => {
    const wrapper = mountPopupBase({ mode: "acknowledge", actionLabel: "OK" });
    const buttons = wrapper.findAll(".vc-button-stub");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].text()).toBe("OK");
  });

  it("shows confirm and cancel buttons in confirm mode", () => {
    const wrapper = mountPopupBase({
      mode: "confirm",
      confirmLabel: "Yes",
      cancelLabel: "No",
    });
    const buttons = wrapper.findAll(".vc-button-stub");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text()).toBe("Yes");
    expect(buttons[1].text()).toBe("No");
  });

  it("emits confirm when confirm button is clicked", async () => {
    const wrapper = mountPopupBase({
      mode: "confirm",
      confirmLabel: "Yes",
      cancelLabel: "No",
    });
    const confirmBtn = wrapper.findAll(".vc-button-stub")[0];
    await confirmBtn.trigger("click");
    expect(wrapper.emitted("confirm")).toHaveLength(1);
  });

  it("calls close when cancel button is clicked in confirm mode", async () => {
    const wrapper = mountPopupBase({
      mode: "confirm",
      confirmLabel: "Yes",
      cancelLabel: "No",
    });
    const cancelBtn = wrapper.findAll(".vc-button-stub")[1];
    await cancelBtn.trigger("click");
    // Cancel triggers the close from VcPopup stub
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("does not close on confirm when closeOnConfirm is false", async () => {
    const wrapper = mountPopupBase({
      mode: "confirm",
      confirmLabel: "Yes",
      cancelLabel: "No",
      closeOnConfirm: false,
    });
    const confirmBtn = wrapper.findAll(".vc-button-stub")[0];
    await confirmBtn.trigger("click");
    expect(wrapper.emitted("confirm")).toHaveLength(1);
    // close should NOT be emitted (closeOnConfirm defaults to false)
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("closes on confirm when closeOnConfirm is true", async () => {
    const wrapper = mountPopupBase({
      mode: "confirm",
      confirmLabel: "Yes",
      cancelLabel: "No",
      closeOnConfirm: true,
    });
    const confirmBtn = wrapper.findAll(".vc-button-stub")[0];
    await confirmBtn.trigger("click");
    expect(wrapper.emitted("confirm")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("applies confirm CSS class in confirm mode", () => {
    const wrapper = mountPopupBase({ mode: "confirm", confirmLabel: "Y", cancelLabel: "N" });
    expect(wrapper.find(".vc-popup-base__actions--confirm").exists()).toBe(true);
  });

  it("applies single CSS class in acknowledge mode", () => {
    const wrapper = mountPopupBase({ mode: "acknowledge", actionLabel: "OK" });
    expect(wrapper.find(".vc-popup-base__actions--single").exists()).toBe(true);
  });
});
