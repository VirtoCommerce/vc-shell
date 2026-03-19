import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";
import VcWidget from "@ui/components/atoms/vc-widget/vc-widget.vue";

describe("VcWidget", () => {
  const mountComponent = (props = {}) =>
    shallowMount(VcWidget as any, {
      props,
      global: { stubs: { VcBadge: { template: "<div><slot /></div>" } } },
    });

  it("renders with vc-widget class", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-widget");
  });

  it("has role='button'", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("role")).toBe("button");
  });

  it("renders title when provided", () => {
    const wrapper = mountComponent({ title: "Orders" });
    expect(wrapper.find(".vc-widget__title").text()).toBe("Orders");
  });

  it("does not render title element when title is not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-widget__content").exists()).toBe(false);
  });

  it("sets aria-label from title", () => {
    const wrapper = mountComponent({ title: "Orders" });
    expect(wrapper.attributes("aria-label")).toBe("Orders");
  });

  it("sets data-widget-id attribute", () => {
    const wrapper = mountComponent({ widgetId: "widget-1" });
    expect(wrapper.attributes("data-widget-id")).toBe("widget-1");
  });

  it("sets data-widget-name from title", () => {
    const wrapper = mountComponent({ title: "Orders" });
    expect(wrapper.attributes("data-widget-name")).toBe("Orders");
  });

  it("applies expanded class", () => {
    const wrapper = mountComponent({ isExpanded: true });
    expect(wrapper.classes()).toContain("vc-widget--expanded");
    expect(wrapper.classes()).not.toContain("vc-widget--collapsed");
  });

  it("applies collapsed class when not expanded", () => {
    const wrapper = mountComponent({ isExpanded: false });
    expect(wrapper.classes()).toContain("vc-widget--collapsed");
    expect(wrapper.classes()).not.toContain("vc-widget--expanded");
  });

  it("applies disabled class", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.classes()).toContain("vc-widget--disabled");
  });

  it("applies horizontal class", () => {
    const wrapper = mountComponent({ horizontal: true });
    expect(wrapper.classes()).toContain("vc-widget--horizontal");
  });

  it("has tabindex 0 by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("tabindex")).toBe("0");
  });

  it("has tabindex -1 when disabled", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.attributes("tabindex")).toBe("-1");
  });

  it("sets aria-disabled when disabled", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });

  it("emits click on click", async () => {
    const wrapper = mountComponent({ title: "Test" });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mountComponent({ disabled: true });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("emits click on Enter key", async () => {
    const wrapper = mountComponent({ title: "Test" });
    await wrapper.trigger("keydown.enter");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("emits click on Space key", async () => {
    const wrapper = mountComponent({ title: "Test" });
    await wrapper.trigger("keydown.space");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click on Enter when disabled", async () => {
    const wrapper = mountComponent({ disabled: true });
    await wrapper.trigger("keydown.enter");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("renders icon when icon prop is provided", () => {
    const wrapper = mountComponent({ icon: "lucide-box" });
    expect(wrapper.find(".vc-widget__icon-container").exists()).toBe(true);
    expect(wrapper.find(".vc-widget__icon").exists()).toBe(true);
  });

  it("does not render icon when icon prop is not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-widget__icon").exists()).toBe(false);
  });
});
