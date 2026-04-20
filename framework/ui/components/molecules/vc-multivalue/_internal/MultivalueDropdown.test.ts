import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MultivalueDropdown from "./MultivalueDropdown.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("@ui/composables", () => ({
  useTeleportTarget: () => ({ teleportTarget: "body" }),
}));

vi.mock("@vueuse/components", () => ({
  vOnClickOutside: { mounted() {}, unmounted() {} },
}));

const baseProps = {
  isOpened: true,
  dropdownStyle: {},
  availableOptions: [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
    { id: 3, name: "Gamma" },
  ],
  optionLabel: "name",
  ariaLabel: "Multivalue dropdown",
  listboxId: "mv-lb-1",
  dropdownToggleRef: null,
};

const globalConfig = {
  stubs: {
    VcIcon: { template: "<span />" },
    teleport: true,
  },
  mocks: { $t: (k: string) => k },
};

describe("MultivalueDropdown", () => {
  it("renders options when isOpened is true", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    const items = wrapper.findAll(".vc-multivalue__item");
    expect(items).toHaveLength(3);
  });

  it("does not render when isOpened is false", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: { ...baseProps, isOpened: false },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-multivalue__dropdown").exists()).toBe(false);
  });

  it("displays option labels from optionLabel property", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    const items = wrapper.findAll(".vc-multivalue__item");
    expect(items[0].text()).toBe("Alpha");
    expect(items[2].text()).toBe("Gamma");
  });

  it("emits select when an option is clicked", async () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    await wrapper.findAll(".vc-multivalue__item")[1].trigger("click");
    expect(wrapper.emitted("select")).toBeTruthy();
    expect(wrapper.emitted("select")![0]).toEqual([{ id: 2, name: "Beta" }]);
  });

  it("renders search input", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    expect(wrapper.find(".vc-multivalue__search").exists()).toBe(true);
  });

  it("emits search event on input", async () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    await wrapper.find(".vc-multivalue__search").trigger("input");
    expect(wrapper.emitted("search")).toBeTruthy();
  });

  it("shows 'no options' message when availableOptions is empty", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: { ...baseProps, availableOptions: [] },
      global: globalConfig,
    });
    expect(wrapper.find(".vc-multivalue__no-options").exists()).toBe(true);
  });

  it("renders scroll buttons", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    const scrollBtns = wrapper.findAll(".vc-multivalue__scroll-button");
    expect(scrollBtns).toHaveLength(2);
  });

  it("sets ARIA attributes correctly", () => {
    const wrapper = mount(MultivalueDropdown, {
      props: baseProps,
      global: globalConfig,
    });
    const dd = wrapper.find(".vc-multivalue__dropdown");
    expect(dd.attributes("role")).toBe("listbox");
    expect(dd.attributes("aria-label")).toBe("Multivalue dropdown");
    expect(dd.attributes("id")).toBe("mv-lb-1");
  });
});
