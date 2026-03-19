import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcTableColumnSwitcher from "./vc-table-column-switcher.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcDropdown: {
    template: '<div class="vc-dropdown-stub"><slot name="trigger" /><slot name="item" v-for="item in items" :item="item" /></div>',
    props: ["modelValue", "items", "placement", "floating", "maxHeight"],
    emits: ["item-click", "update:modelValue"],
  },
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["size", "iconSize", "icon"],
  },
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
};

const items = [
  { id: "name", title: "Name", visible: true },
  { id: "email", title: "Email", visible: true },
  { id: "phone", title: "Phone", visible: false },
];

function factory(props: Record<string, unknown> = {}) {
  return mount(VcTableColumnSwitcher, {
    props: {
      items,
      stateKey: "test_table",
      ...props,
    },
    global: {
      stubs,
      mocks: {
        $t: (k: string) => k,
        $te: () => false,
      },
    },
  });
}

describe("VcTableColumnSwitcher", () => {
  it("renders switcher container", () => {
    const w = factory();
    expect(w.find(".vc-table-column-switcher").exists()).toBe(true);
  });

  it("renders dropdown", () => {
    const w = factory();
    expect(w.find(".vc-dropdown-stub").exists()).toBe(true);
  });

  it("renders toggle button", () => {
    const w = factory();
    expect(w.find(".vc-table-column-switcher__toggle-button").exists()).toBe(true);
  });

  it("renders items", () => {
    const w = factory();
    const itemElements = w.findAll(".vc-table-column-switcher__item");
    expect(itemElements.length).toBe(3);
  });

  it("displays item titles", () => {
    const w = factory();
    const titles = w.findAll(".vc-table-column-switcher__item-title");
    expect(titles[0].text()).toBe("Name");
    expect(titles[2].text()).toBe("Phone");
  });
});
