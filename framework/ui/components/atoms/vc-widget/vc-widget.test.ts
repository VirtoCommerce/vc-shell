import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { computed, nextTick, ref } from "vue";
import { mount, shallowMount } from "@vue/test-utils";
import { WidgetRenderStateKey } from "@ui/components/organisms/vc-blade/_internal/widgets/widget-render-state";
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

describe("VcWidget render state", () => {
  const mountWith = (state: Record<string, unknown> | null, props = {}) =>
    mount(VcWidget as any, {
      props,
      global: { provide: state ? { [WidgetRenderStateKey as symbol]: state } : {} },
    });

  it("renders no dot or highlight without injected state", () => {
    const wrapper = mountWith(null, { icon: "x", value: 2 });
    expect(wrapper.find(".vc-widget__alert-dot").exists()).toBe(false);
    expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(false);
  });

  it("renders a dot variant mapped from severity", () => {
    const wrapper = mountWith({ alertSeverity: computed(() => "error"), editing: ref(false) });
    expect(wrapper.find(".vc-widget__icon-container .vc-widget__alert-dot--danger").exists()).toBe(true);
  });

  it("hides badge and dot while editing", () => {
    const wrapper = mountWith({ alertSeverity: computed(() => "warning"), editing: ref(true) }, { value: 4 });
    expect(wrapper.find(".vc-widget__alert-dot").exists()).toBe(false);
    expect(wrapper.find(".vc-badge__badge").exists()).toBe(false);
  });

  it("shows the badge when not editing", () => {
    const wrapper = mountWith({ alertSeverity: computed(() => undefined), editing: ref(false) }, { value: 4 });
    expect(wrapper.find(".vc-badge__badge").exists()).toBe(true);
  });

  it("exposes alerts to assistive tech", () => {
    const wrapper = mountWith(
      {
        alertSeverity: computed(() => "warning"),
        alertsDescription: computed(() => "2 need attention"),
        alertsOpen: ref(false),
        editing: ref(false),
      },
      { title: "Orders" },
    );
    const root = wrapper.find(".vc-widget");
    expect(root.attributes("aria-label")).toBe("Orders");
    expect(root.attributes("aria-haspopup")).toBe("dialog");
    expect(root.attributes("aria-expanded")).toBe("false");
    const describedBy = root.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`[id="${describedBy}"]`).text()).toBe("2 need attention");
  });

  it("reflects the open popup in aria-expanded", () => {
    const wrapper = mountWith({
      alertSeverity: computed(() => "info"),
      alertsDescription: computed(() => "1 need attention"),
      alertsOpen: ref(true),
      editing: ref(false),
    });
    expect(wrapper.find(".vc-widget").attributes("aria-expanded")).toBe("true");
  });

  it("adds no popup attributes without alerts or while editing", () => {
    for (const state of [
      { alertsDescription: computed(() => undefined), editing: ref(false) },
      { alertsDescription: computed(() => "1 need attention"), editing: ref(true) },
      null,
    ]) {
      const wrapper = mountWith(
        state && { alertSeverity: computed(() => undefined), alertsOpen: ref(false), ...state },
        { title: "T" },
      );
      const root = wrapper.find(".vc-widget");
      expect(root.attributes("aria-haspopup")).toBeUndefined();
      expect(root.attributes("aria-expanded")).toBeUndefined();
      expect(root.attributes("aria-describedby")).toBeUndefined();
    }
  });

  describe("badge change highlight", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const blade = () => ({ alertSeverity: computed(() => undefined), editing: ref(false) });

    it("marks a changed value for 1.5s inside a blade, after the first load", async () => {
      const wrapper = mountWith(blade(), { value: 0 });
      await wrapper.setProps({ value: 2 });
      expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(false);
      await wrapper.setProps({ value: 3 });
      expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(true);
      vi.advanceTimersByTime(1500);
      await nextTick();
      expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(false);
    });

    it("does not mark the first value", async () => {
      const wrapper = mountWith(blade(), {});
      await wrapper.setProps({ value: 2 });
      expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(false);
    });

    it("never pulses outside a blade", async () => {
      const wrapper = mountWith(null, { value: 2 });
      await wrapper.setProps({ value: 3 });
      await wrapper.setProps({ value: 4 });
      expect(wrapper.find(".vc-widget__badge--changed").exists()).toBe(false);
    });
  });
});
