import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableSearchHeader from "./TableSearchHeader.vue";

const stubs = {
  VcInput: {
    template:
      '<input class="vc-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["modelValue", "placeholder", "size", "clearable"],
  },
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
  VcButton: {
    template: '<button class="vc-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "icon", "disabled"],
  },
};

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(TableSearchHeader, {
    props: { visible: true, ...props },
    slots,
    global: { stubs },
  });
}

describe("TableSearchHeader", () => {
  it("renders when visible=true", () => {
    const w = factory();
    expect(w.find(".vc-table-search-header").exists()).toBe(true);
  });

  it("does not render when visible=false", () => {
    const w = factory({ visible: false });
    expect(w.find(".vc-table-search-header").exists()).toBe(false);
  });

  it("shows search input when searchable=true (default)", () => {
    const w = factory();
    expect(w.find(".vc-table-search-header__search").exists()).toBe(true);
  });

  it("hides search input when searchable=false", () => {
    const w = factory({ searchable: false });
    expect(w.find(".vc-table-search-header__search").exists()).toBe(false);
  });

  it("renders actions slot", () => {
    const w = factory({}, { actions: "<button>Bulk Delete</button>" });
    expect(w.find(".vc-table-search-header__actions").exists()).toBe(true);
    expect(w.text()).toContain("Bulk Delete");
  });

  it("shows filter button when showFilterButton=true", () => {
    const w = factory({ showFilterButton: true });
    expect(w.find(".vc-table-search-header__filters").exists()).toBe(true);
  });

  it("emits filterToggle when filter button clicked", async () => {
    const w = factory({ showFilterButton: true });
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("filterToggle")).toBeTruthy();
    expect(w.emitted("filterToggle")![0]).toEqual([true]);
  });

  it("shows filter badge when activeFilterCount > 0", () => {
    const w = factory({ showFilterButton: true, activeFilterCount: 2 });
    expect(w.find(".vc-table-search-header__filter-badge").text()).toBe("2");
  });

  it("emits filterToggle with toggled value on second click", async () => {
    const w = factory({ showFilterButton: true });
    await w.find(".vc-button-stub").trigger("click");
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("filterToggle")![1]).toEqual([false]);
  });
});
