import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcButtonGroup from "@ui/components/atoms/vc-button/vc-button-group.vue";
import { ButtonGroupKey } from "@ui/components/atoms/vc-button/types";
import { defineComponent, h, inject } from "vue";

describe("VcButtonGroup", () => {
  const mountComponent = (props = {}, slots = {}) => mount(VcButtonGroup as any, { props, slots });

  it("renders with role='group'", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("renders default slot content", () => {
    const wrapper = mountComponent({}, { default: () => h("button", "Click") });
    expect(wrapper.text()).toContain("Click");
  });

  it("applies horizontal class by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-button-group");
    expect(wrapper.classes()).toContain("vc-button-group--horizontal");
  });

  it("applies vertical class when orientation is vertical", () => {
    const wrapper = mountComponent({ orientation: "vertical" });
    expect(wrapper.classes()).toContain("vc-button-group--vertical");
    expect(wrapper.classes()).not.toContain("vc-button-group--horizontal");
  });

  it("applies attached class when attached is true", () => {
    const wrapper = mountComponent({ attached: true });
    expect(wrapper.classes()).toContain("vc-button-group--attached");
  });

  it("does not apply attached class by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).not.toContain("vc-button-group--attached");
  });

  it("provides ButtonGroupKey with size and attached to children", () => {
    let injectedValue: any;
    const Child = defineComponent({
      setup() {
        injectedValue = inject(ButtonGroupKey);
        return () => h("span");
      },
    });

    mount(VcButtonGroup as any, {
      props: { size: "sm", attached: true },
      slots: { default: () => h(Child) },
    });

    expect(injectedValue).toBeDefined();
    expect(injectedValue.size.value).toBe("sm");
    expect(injectedValue.attached.value).toBe(true);
  });

  it("provides undefined size when not specified", () => {
    let injectedValue: any;
    const Child = defineComponent({
      setup() {
        injectedValue = inject(ButtonGroupKey);
        return () => h("span");
      },
    });

    mount(VcButtonGroup as any, {
      slots: { default: () => h(Child) },
    });

    expect(injectedValue.size.value).toBeUndefined();
  });
});
