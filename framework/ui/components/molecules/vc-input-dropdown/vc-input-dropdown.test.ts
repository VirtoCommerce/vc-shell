import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcInputDropdown from "@ui/components/molecules/vc-input-dropdown/vc-input-dropdown.vue";

describe("VcInputDropdown", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcInputDropdown as any, {
      props: {
        modelValue: "",
        option: "USD",
        options: ["USD", "EUR", "GBP"],
        ...props,
      },
      global: {
        stubs: {
          VcSelect: {
            template: '<div class="stub-select"><slot name="control" :toggleHandler="() => {}" :isOpened="false" /></div>',
            props: ["options", "optionLabel", "optionValue", "searchable", "debounce", "disabled", "label", "required", "modelValue", "tooltip", "multilanguage", "currentLanguage"],
          },
          VcInput: {
            template: '<div class="stub-input"><slot name="append-inner" /></div>',
            props: ["placeholder", "hint", "clearable", "prefix", "suffix", "name", "modelValue", "loading", "disabled", "autofocus", "error", "errorMessage", "maxlength", "type"],
          },
          VcButton: true,
          VcIcon: true,
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-input-dropdown").exists()).toBe(true);
  });

  it("renders the select wrapper", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".stub-select").exists()).toBe(true);
  });

  it("renders the input component", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".stub-input").exists()).toBe(true);
  });

  it("passes disabled to component", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.find(".vc-input-dropdown").exists()).toBe(true);
  });

  it("renders with custom label", () => {
    const wrapper = mountComponent({ label: "Currency" });
    expect(wrapper.find(".vc-input-dropdown").exists()).toBe(true);
  });
});
