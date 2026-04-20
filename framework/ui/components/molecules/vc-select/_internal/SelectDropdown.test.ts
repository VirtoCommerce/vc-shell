import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import SelectDropdown from "./SelectDropdown.vue";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useTeleportTarget — return body
vi.mock("@ui/composables", () => ({
  useTeleportTarget: () => ({ teleportTarget: "body" }),
  useScrollArrows: () => ({
    canScrollUp: { value: false },
    canScrollDown: { value: false },
    startScroll: vi.fn(),
    stopScroll: vi.fn(),
    updateScrollState: vi.fn(),
  }),
}));

// Mock vOnClickOutside directive
vi.mock("@vueuse/components", () => ({
  vOnClickOutside: { mounted() {}, unmounted() {} },
}));

const VcScrollableContainerStub = defineComponent({
  name: "VcScrollableContainer",
  setup(_, { slots, expose }) {
    const viewportRef = null;
    expose({ viewportRef, updateScrollState: vi.fn() });
    return () => h("div", { class: "vc-select__scroll-container" }, slots.default?.());
  },
});

function makeOptionScope(count: number, selected = -1) {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    opt: { id: i, label: `Option ${i}` },
    selected: i === selected,
    label: `Option ${i}`,
    toggleOption: vi.fn(),
  }));
}

const baseProps = {
  isOpened: true,
  listboxId: "lb-1",
  ariaLabel: "Test select",
  dropdownStyle: {},
  searchable: false,
  optionScope: makeOptionScope(3),
  listLoading: false,
  optionsListLength: 3,
  hasNextPage: false,
  dropdownToggleRef: null,
};

const globalConfig = {
  stubs: {
    VcScrollableContainer: VcScrollableContainerStub,
    VcIcon: { template: "<span />" },
    teleport: true,
  },
};

describe("SelectDropdown", () => {
  it("renders options when isOpened is true", () => {
    const wrapper = mount(SelectDropdown, { props: baseProps, global: globalConfig });
    const options = wrapper.findAll("[data-test-id='option']");
    expect(options).toHaveLength(3);
  });

  it("does not render dropdown content when isOpened is false", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, isOpened: false },
      global: globalConfig,
    });
    expect(wrapper.find("[data-test-id='dropdown']").exists()).toBe(false);
  });

  it("renders search input when searchable is true", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, searchable: true },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-select__search-input").exists()).toBe(true);
  });

  it("does not render search input when searchable is false", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, searchable: false },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-select__search-input").exists()).toBe(false);
  });

  it("emits input event when search input receives input", async () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, searchable: true },
      global: globalConfig,
    });
    const input = wrapper.find(".vc-select__search-input");
    await input.trigger("input");
    expect(wrapper.emitted("input")).toBeTruthy();
  });

  it("calls toggleOption when option is clicked", async () => {
    const scope = makeOptionScope(2);
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, optionScope: scope },
      global: globalConfig,
    });
    const options = wrapper.findAll("[data-test-id='option']");
    await options[1].trigger("click");
    expect(scope[1].toggleOption).toHaveBeenCalledWith(scope[1].opt);
  });

  it("marks selected option with --selected class", () => {
    const scope = makeOptionScope(3, 1);
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, optionScope: scope },
      global: globalConfig,
    });
    const options = wrapper.findAll("[data-test-id='option']");
    expect(options[1].classes()).toContain("vc-select__option--selected");
    expect(options[0].classes()).not.toContain("vc-select__option--selected");
  });

  it("shows loading indicator when listLoading is true", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, listLoading: true },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-select__list-loading-indicator").exists()).toBe(true);
  });

  it("shows 'no options' when not loading and optionsListLength is 0", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, optionScope: [], optionsListLength: 0, listLoading: false },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-select__no-options").exists()).toBe(true);
  });

  it("renders load-more trigger when hasNextPage and not loading", () => {
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, hasNextPage: true, listLoading: false },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-select__load-more-trigger").exists()).toBe(true);
  });

  it("sets correct ARIA attributes", () => {
    const wrapper = mount(SelectDropdown, { props: baseProps, global: globalConfig });
    const dropdown = wrapper.find("[data-test-id='dropdown']");
    expect(dropdown.attributes("role")).toBe("listbox");
    expect(dropdown.attributes("aria-label")).toBe("Test select");
    expect(dropdown.attributes("id")).toBe("lb-1");
  });

  it("option has correct aria-selected", () => {
    const scope = makeOptionScope(2, 0);
    const wrapper = mount(SelectDropdown, {
      props: { ...baseProps, optionScope: scope },
      global: globalConfig,
    });
    const options = wrapper.findAll("[role='option']");
    expect(options[0].attributes("aria-selected")).toBe("true");
    expect(options[1].attributes("aria-selected")).toBe("false");
  });
});
