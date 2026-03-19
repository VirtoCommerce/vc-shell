import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcRadioButton from "@ui/components/molecules/vc-radio-button/vc-radio-button.vue";

// Mock useFormField — return reactive refs matching props
vi.mock("@ui/composables/useFormField", () => ({
  useFormField: (props: any) => {
    const { computed, ref } = require("vue");
    return {
      fieldId: ref("radio-1"),
      errorId: ref("radio-error-1"),
      invalid: computed(() => !!props.errorMessage),
      resolvedDisabled: computed(() => !!props.disabled),
      resolvedName: ref(props.name || "RadioField"),
      ariaRequired: ref(!!props.required),
      ariaDescribedBy: ref(undefined),
    };
  },
}));

describe("VcRadioButton", () => {
  const mountComponent = (props = {}, slots = {}) =>
    mount(VcRadioButton as any, {
      props: {
        label: "Option A",
        value: "a",
        ...props,
      },
      slots,
      global: {
        stubs: {
          VcHint: true,
          Transition: false,
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-radio-button").exists()).toBe(true);
  });

  it("renders label text", () => {
    const wrapper = mountComponent({ label: "Option B" });
    expect(wrapper.text()).toContain("Option B");
  });

  it("renders radio input", () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[type="radio"]');
    expect(input.exists()).toBe(true);
  });

  it("sets value on radio input", () => {
    const wrapper = mountComponent({ value: "b" });
    const input = wrapper.find('input[type="radio"]');
    expect((input.element as HTMLInputElement).value).toBe("b");
  });

  it("is checked when modelValue matches value", () => {
    const wrapper = mountComponent({ value: "a", modelValue: "a" });
    const input = wrapper.find('input[type="radio"]');
    expect((input.element as HTMLInputElement).checked).toBe(true);
  });

  it("is not checked when modelValue does not match value", () => {
    const wrapper = mountComponent({ value: "a", modelValue: "b" });
    const input = wrapper.find('input[type="radio"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);
  });

  it("emits update:modelValue on change when not disabled", async () => {
    const wrapper = mountComponent({ value: "a", modelValue: "b", disabled: false });
    const input = wrapper.find('input[type="radio"]');
    await input.trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["a"]);
  });

  it("does not emit update:modelValue when disabled", async () => {
    const wrapper = mountComponent({ value: "a", modelValue: "b", disabled: true });
    const input = wrapper.find('input[type="radio"]');
    await input.trigger("change");
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("renders error hint when errorMessage is provided", () => {
    const wrapper = mountComponent({ errorMessage: "Required field" });
    expect(wrapper.findComponent({ name: "VcHint" }).exists()).toBe(true);
  });

  it("applies error class on input when invalid", () => {
    const wrapper = mountComponent({ errorMessage: "Error" });
    const input = wrapper.find('input[type="radio"]');
    expect(input.classes()).toContain("vc-radio-button--error");
  });
});
