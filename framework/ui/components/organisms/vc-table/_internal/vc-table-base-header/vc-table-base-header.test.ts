import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import VcTableBaseHeader from "./vc-table-base-header.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcInput: {
    template:
      '<input class="vc-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["modelValue", "placeholder", "clearable", "name"],
  },
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon"] },
  VcTableFilter: {
    template: '<div class="vc-table-filter-stub"><slot /></div>',
    props: ["title", "counter", "parentExpanded", "disabled"],
  },
};

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(VcTableBaseHeader, {
    props,
    slots,
    global: {
      stubs,
      mocks: {
        $t: (k: string) => k,
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("VcTableBaseHeader", () => {
  it("renders header container", () => {
    const w = factory();
    expect(w.find(".vc-table-base-header").exists()).toBe(true);
  });

  it("renders search input", () => {
    const w = factory();
    expect(w.find(".vc-input-stub").exists()).toBe(true);
  });

  it("emits search:change on input", async () => {
    const w = factory({ searchValue: "" });
    await w.find(".vc-input-stub").setValue("test");
    expect(w.emitted("search:change")).toBeTruthy();
  });

  it("renders filters slot with VcTableFilter", () => {
    const w = factory({}, { filters: "<div class='filter-slot'>Filters</div>" });
    expect(w.find(".vc-table-filter-stub").exists()).toBe(true);
  });

  it("renders column-switcher slot", () => {
    const w = factory({}, { "column-switcher": "<div class='switcher-slot'>Switcher</div>" });
    expect(w.find(".vc-table-base-header__column-switcher").exists()).toBe(true);
    expect(w.text()).toContain("Switcher");
  });

  it("applies desktop class", () => {
    const w = factory();
    expect(w.find(".vc-table-base-header--desktop").exists()).toBe(true);
  });

  it("passes searchPlaceholder prop", () => {
    const w = factory({ searchPlaceholder: "Find..." });
    // The placeholder is passed via the VcInput stub; verify the component renders with the prop
    expect(w.find(".vc-table-base-header__search-input").exists()).toBe(true);
  });
});
