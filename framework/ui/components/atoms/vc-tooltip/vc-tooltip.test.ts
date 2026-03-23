import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import VcTooltip from "@ui/components/atoms/vc-tooltip/vc-tooltip.vue";

describe("VcTooltip", () => {
  const mountComponent = (props = {}, slots = {}) =>
    mount(VcTooltip as any, {
      props,
      slots: {
        default: () => h("button", "Trigger"),
        ...slots,
      },
      global: {
        stubs: { teleport: true },
      },
    });

  it("renders trigger slot content", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-tooltip__trigger").text()).toContain("Trigger");
  });

  it("has vc-tooltip class on root", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-tooltip");
  });

  it("does not show tooltip content initially", () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("shows tooltip on mouseenter", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(true);
  });

  it("hides tooltip on mouseleave", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(true);
    await wrapper.trigger("mouseleave");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("shows tooltip on focusin", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("focusin");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(true);
  });

  it("hides tooltip on focusout", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("focusin");
    await nextTick();
    await wrapper.trigger("focusout");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("hides tooltip on escape key", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    await wrapper.trigger("keydown.escape");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("does not show tooltip when disabled", async () => {
    const wrapper = mountComponent({ disabled: true }, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("does not show tooltip when tooltip slot is not provided", async () => {
    const wrapper = mountComponent();
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find("[role='tooltip']").exists()).toBe(false);
  });

  it("applies variant class to wrapper", async () => {
    const wrapper = mountComponent({ variant: "dark" }, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find(".vc-tooltip__wrapper--dark").exists()).toBe(true);
  });

  it("renders arrow by default", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find(".vc-tooltip__arrow").exists()).toBe(true);
  });

  it("does not render arrow when arrow is false", async () => {
    const wrapper = mountComponent({ arrow: false }, { tooltip: () => "Tooltip text" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    expect(wrapper.find(".vc-tooltip__arrow").exists()).toBe(false);
  });

  it("sets aria-describedby on trigger when tooltip is visible", async () => {
    const wrapper = mountComponent({}, { tooltip: () => "Tooltip text" });
    const trigger = wrapper.find(".vc-tooltip__trigger");
    expect(trigger.attributes("aria-describedby")).toBeUndefined();
    await wrapper.trigger("mouseenter");
    await nextTick();
    const id = trigger.attributes("aria-describedby");
    expect(id).toBeTruthy();
    expect(wrapper.find(`#${id}`).exists()).toBe(true);
  });
});
