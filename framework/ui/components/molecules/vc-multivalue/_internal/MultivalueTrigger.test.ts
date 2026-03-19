import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MultivalueTrigger from "./MultivalueTrigger.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const baseProps = {
  modelValue: [],
  isDictionaryMode: false,
  type: "text",
  htmlInputType: "text",
  disabled: false,
  error: false,
  loading: false,
  clearable: false,
  optionValue: "id",
  formatValue: (item: any) => item?.name ?? String(item),
};

describe("MultivalueTrigger", () => {
  it("renders text input in non-dictionary mode", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: baseProps,
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__input").exists()).toBe(true);
    expect(wrapper.find(".vc-multivalue__add-button").exists()).toBe(false);
  });

  it("renders add button in dictionary mode", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, isDictionaryMode: true },
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__add-button").exists()).toBe(true);
    expect(wrapper.find(".vc-multivalue__input").exists()).toBe(false);
  });

  it("renders chips for each model value item", () => {
    const items = [
      { id: 1, name: "Red" },
      { id: 2, name: "Blue" },
    ];
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, modelValue: items },
      global: { mocks: { $t: (k: string) => k } },
    });
    const chips = wrapper.findAll(".vc-multivalue__chip");
    expect(chips).toHaveLength(2);
    expect(chips[0].text()).toContain("Red");
    expect(chips[1].text()).toContain("Blue");
  });

  it("emits remove when chip remove icon is clicked", async () => {
    const items = [{ id: 1, name: "Red" }];
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, modelValue: items },
      global: { mocks: { $t: (k: string) => k } },
    });
    await wrapper.find(".vc-multivalue__chip-remove").trigger("click");
    expect(wrapper.emitted("remove")).toBeTruthy();
    expect(wrapper.emitted("remove")![0]).toEqual([0]);
  });

  it("does not render chip remove icon when disabled", () => {
    const items = [{ id: 1, name: "Red" }];
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, modelValue: items, disabled: true },
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__chip-remove").exists()).toBe(false);
  });

  it("emits toggleDropdown when add button is clicked in dictionary mode", async () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, isDictionaryMode: true },
      global: { mocks: { $t: (k: string) => k } },
    });
    await wrapper.find(".vc-multivalue__add-button").trigger("click");
    expect(wrapper.emitted("toggleDropdown")).toBeTruthy();
  });

  it("emits inputSubmit on Enter key in input mode", async () => {
    const wrapper = mount(MultivalueTrigger, {
      props: baseProps,
      global: { mocks: { $t: (k: string) => k } },
    });
    await wrapper.find(".vc-multivalue__input").trigger("keypress.enter");
    expect(wrapper.emitted("inputSubmit")).toBeTruthy();
  });

  it("emits inputChange on input event", async () => {
    const wrapper = mount(MultivalueTrigger, {
      props: baseProps,
      global: { mocks: { $t: (k: string) => k } },
    });
    const input = wrapper.find(".vc-multivalue__input");
    // Simulate native input event with a value
    const nativeInput = input.element as HTMLInputElement;
    nativeInput.value = "hello";
    await input.trigger("input");
    expect(wrapper.emitted("inputChange")).toBeTruthy();
  });

  it("emits inputSubmit and blur on input blur", async () => {
    const wrapper = mount(MultivalueTrigger, {
      props: baseProps,
      global: { mocks: { $t: (k: string) => k } },
    });
    await wrapper.find(".vc-multivalue__input").trigger("blur");
    expect(wrapper.emitted("inputSubmit")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });

  it("shows clear button when clearable with values", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, clearable: true, modelValue: [{ id: 1, name: "A" }] },
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__clear").exists()).toBe(true);
  });

  it("emits clearAll when clear button clicked", async () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, clearable: true, modelValue: [{ id: 1, name: "A" }] },
      global: { mocks: { $t: (k: string) => k } },
    });
    await wrapper.find(".vc-multivalue__clear").trigger("click");
    expect(wrapper.emitted("clearAll")).toBeTruthy();
  });

  it("hides clear button when disabled", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, clearable: true, disabled: true, modelValue: [{ id: 1, name: "A" }] },
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__clear").exists()).toBe(false);
  });

  it("shows loading indicator when loading", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, loading: true },
      global: { mocks: { $t: (k: string) => k } },
    });
    expect(wrapper.find(".vc-multivalue__loading").exists()).toBe(true);
  });

  it("sets ARIA attributes in dictionary mode", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, isDictionaryMode: true, isOpened: true, listboxId: "mv-lb", labelId: "mv-lbl" },
      global: { mocks: { $t: (k: string) => k } },
    });
    const root = wrapper.find(".vc-multivalue__field-wrapper");
    expect(root.attributes("role")).toBe("combobox");
    expect(root.attributes("aria-expanded")).toBe("true");
    expect(root.attributes("aria-haspopup")).toBe("listbox");
  });

  it("renders color square for color type items", () => {
    const items = [{ id: 1, name: "Red", colorCode: "#ff0000" }];
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, type: "color", modelValue: items },
      global: { mocks: { $t: (k: string) => k } },
    });
    const colorSquare = wrapper.find(".vc-multivalue__color-square");
    expect(colorSquare.exists()).toBe(true);
    expect((colorSquare.element as HTMLElement).style.backgroundColor).toBeTruthy();
  });

  it("renders placeholder on text input", () => {
    const wrapper = mount(MultivalueTrigger, {
      props: { ...baseProps, placeholder: "Enter value" },
      global: { mocks: { $t: (k: string) => k } },
    });
    const input = wrapper.find(".vc-multivalue__input");
    expect(input.attributes("placeholder")).toBe("Enter value");
  });
});
