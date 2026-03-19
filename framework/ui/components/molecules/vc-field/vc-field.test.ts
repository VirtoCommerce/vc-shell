import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcField from "@ui/components/molecules/vc-field/vc-field.vue";

describe("VcField", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcField as any, {
      props,
      global: {
        stubs: {
          VcLabel: {
            template: '<div class="stub-label"><slot /></div>',
            props: ["required", "multilanguage", "currentLanguage", "error"],
          },
          VcCol: {
            template: '<div class="stub-col"><slot /></div>',
            props: ["size"],
          },
          VcFieldType: {
            template: '<div class="stub-field-type"><slot /></div>',
            props: ["value", "type"],
          },
          VcButton: true,
        },
      },
    });

  it("renders correctly with default props", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-field").exists()).toBe(true);
  });

  it("applies vertical orientation by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-field--vertical").exists()).toBe(true);
  });

  it("applies horizontal orientation", () => {
    const wrapper = mountComponent({ orientation: "horizontal" });
    expect(wrapper.find(".vc-field--horizontal").exists()).toBe(true);
  });

  it("renders label when provided", () => {
    const wrapper = mountComponent({ label: "Name" });
    expect(wrapper.find(".stub-label").exists()).toBe(true);
    expect(wrapper.find(".stub-label").text()).toContain("Name");
  });

  it("does not render label when not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".stub-label").exists()).toBe(false);
  });

  it("passes modelValue to field type", () => {
    const wrapper = mountComponent({ modelValue: "Test value" });
    const fieldType = wrapper.find(".stub-field-type");
    expect(fieldType.exists()).toBe(true);
  });

  it("renders copy button when copyable is true", () => {
    const wrapper = mountComponent({ copyable: true });
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(true);
  });

  it("does not render copy button when copyable is false", () => {
    const wrapper = mountComponent({ copyable: false });
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
  });

  it("renders with type prop", () => {
    const wrapper = mountComponent({ type: "date", modelValue: "2024-01-01" });
    expect(wrapper.find(".vc-field").exists()).toBe(true);
  });
});
