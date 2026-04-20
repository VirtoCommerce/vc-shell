import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableGroupRow from "./TableGroupRow.vue";

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "ariaExpanded", "ariaLabel"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableGroupRow, {
    props: { groupKey: "Category A", count: 5, ...props },
    global: { stubs },
  });
}

describe("TableGroupRow", () => {
  it("renders group header", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__group-header").exists()).toBe(true);
  });

  it("displays group key", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__group-header-key").text()).toBe("Category A");
  });

  it("displays count", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__group-header-count").text()).toBe("(5)");
  });

  it("applies expandable class when expandable", () => {
    const w = factory({ expandable: true });
    expect(w.find(".vc-table-composition__group-header--expandable").exists()).toBe(true);
  });

  it("applies expanded class when expanded", () => {
    const w = factory({ expandable: true, expanded: true });
    expect(w.find(".vc-table-composition__group-header--expanded").exists()).toBe(true);
  });

  it("applies collapsed class when not expanded", () => {
    const w = factory({ expandable: true, expanded: false });
    expect(w.find(".vc-table-composition__group-header--collapsed").exists()).toBe(true);
  });

  it("emits toggle on button click", async () => {
    const w = factory({ expandable: true });
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("toggle")).toBeTruthy();
  });

  it("emits click on header click", async () => {
    const w = factory();
    await w.find(".vc-table-composition__group-header").trigger("click");
    expect(w.emitted("click")).toBeTruthy();
  });

  it("renders slot content instead of default", () => {
    const w = mount(TableGroupRow, {
      props: { groupKey: "G", count: 1 },
      slots: { default: "<span class='custom'>Custom</span>" },
      global: { stubs },
    });
    expect(w.find(".custom").exists()).toBe(true);
  });
});
