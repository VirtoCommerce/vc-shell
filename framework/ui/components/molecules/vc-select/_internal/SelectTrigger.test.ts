import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import SelectTrigger from "./SelectTrigger.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  isOpened: false,
  hasValue: false,
  selectedScope: [],
  multiple: false,
  loading: false,
  disabled: false,
  clearable: false,
  listLoading: false,
  defaultOptionLoading: false,
  listboxId: "lb-1",
  labelId: "lbl-1",
  errorId: "err-1",
  hintId: "hint-1",
  toggleDropdown: vi.fn(),
  getOptionLabel: (opt: any) => opt?.label ?? "",
  getEmittingOptionValue: (opt: any) => opt?.label ?? "",
};

describe("SelectTrigger", () => {
  it("renders placeholder when hasValue is false", () => {
    const wrapper = mount(SelectTrigger, { props: baseProps });
    expect(wrapper.find(".vc-select__placeholder").exists()).toBe(true);
  });

  it("renders custom placeholder text", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, placeholder: "Pick one" },
    });
    expect(wrapper.find(".vc-select__placeholder").text()).toBe("Pick one");
  });

  it("renders default placeholder from i18n when no placeholder prop", () => {
    const wrapper = mount(SelectTrigger, { props: baseProps });
    expect(wrapper.find(".vc-select__placeholder").text()).toBe(
      "COMPONENTS.MOLECULES.VC_SELECT.CLICK_TO_SELECT",
    );
  });

  it("renders selected single value", () => {
    const scope = [
      {
        index: 0,
        opt: { label: "Apple" },
        selected: true,
        toggleOption: vi.fn(),
        removeAtIndex: vi.fn(),
      },
    ];
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, selectedScope: scope },
    });
    expect(wrapper.find(".vc-select__selected").exists()).toBe(true);
    expect(wrapper.text()).toContain("Apple");
  });

  it("renders multiple selected items with remove buttons", () => {
    const scope = [0, 1].map((i) => ({
      index: i,
      opt: { label: `Item ${i}` },
      selected: true,
      toggleOption: vi.fn(),
      removeAtIndex: vi.fn(),
    }));
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, multiple: true, selectedScope: scope },
    });
    const chips = wrapper.findAll(".vc-select__multiple-item");
    expect(chips).toHaveLength(2);
    expect(wrapper.findAll(".vc-select__chip-remove")).toHaveLength(2);
  });

  it("does not render remove button when disabled in multiple mode", () => {
    const scope = [
      {
        index: 0,
        opt: { label: "X" },
        selected: true,
        toggleOption: vi.fn(),
        removeAtIndex: vi.fn(),
      },
    ];
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, multiple: true, disabled: true, selectedScope: scope },
    });
    expect(wrapper.find(".vc-select__chip-remove").exists()).toBe(false);
  });

  it("emits removeAtIndex when chip remove button clicked", async () => {
    const scope = [
      {
        index: 0,
        opt: { label: "X" },
        selected: true,
        toggleOption: vi.fn(),
        removeAtIndex: vi.fn(),
      },
    ];
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, multiple: true, selectedScope: scope },
    });
    await wrapper.find(".vc-select__chip-remove").trigger("click");
    expect(wrapper.emitted("removeAtIndex")).toBeTruthy();
    expect(wrapper.emitted("removeAtIndex")![0]).toEqual([0]);
  });

  it("calls toggleDropdown on combobox click", async () => {
    const toggle = vi.fn();
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, toggleDropdown: toggle },
    });
    await wrapper.find("[data-test-id='dropdown-toggle']").trigger("click");
    expect(toggle).toHaveBeenCalled();
  });

  it("shows clearable button when clearable, hasValue and not disabled", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, clearable: true, selectedScope: [{ index: 0, opt: { label: "A" }, selected: true, toggleOption: vi.fn(), removeAtIndex: vi.fn() }] },
    });
    expect(wrapper.find(".vc-select__clear").exists()).toBe(true);
  });

  it("emits reset when clear button clicked", async () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hasValue: true, clearable: true, selectedScope: [{ index: 0, opt: { label: "A" }, selected: true, toggleOption: vi.fn(), removeAtIndex: vi.fn() }] },
    });
    await wrapper.find(".vc-select__clear").trigger("click");
    expect(wrapper.emitted("reset")).toBeTruthy();
  });

  it("shows loading spinner when loading", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, loading: true },
    });
    expect(wrapper.find(".vc-select__loading-icon").exists()).toBe(true);
  });

  it("hides chevron when disabled", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, disabled: true },
    });
    expect(wrapper.find(".vc-select__chevron-container").exists()).toBe(false);
  });

  it("shows error message", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, error: true, errorMessage: "Required field" },
    });
    expect(wrapper.text()).toContain("Required field");
  });

  it("shows hint when no error", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, hint: "Select an option" },
    });
    expect(wrapper.text()).toContain("Select an option");
  });

  it("renders prefix and suffix", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, prefix: "$", suffix: "USD" },
    });
    expect(wrapper.find(".vc-select__prefix").text()).toBe("$");
    expect(wrapper.find(".vc-select__suffix").text()).toBe("USD");
  });

  it("sets aria-expanded on combobox", () => {
    const wrapper = mount(SelectTrigger, {
      props: { ...baseProps, isOpened: true },
    });
    expect(wrapper.find("[role='combobox']").attributes("aria-expanded")).toBe("true");
  });

  it("emits focus and blur events", async () => {
    const wrapper = mount(SelectTrigger, { props: baseProps });
    const combobox = wrapper.find("[role='combobox']");
    await combobox.trigger("focus");
    await combobox.trigger("blur");
    expect(wrapper.emitted("focus")).toBeTruthy();
    expect(wrapper.emitted("blur")).toBeTruthy();
  });
});
