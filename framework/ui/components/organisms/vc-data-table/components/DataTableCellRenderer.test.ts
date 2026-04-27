import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DataTableCellRenderer from "./DataTableCellRenderer.vue";
import { ColumnCollectorKey } from "@ui/components/organisms/vc-data-table/keys";

const stubs = {
  TableCheckbox: { template: '<div class="table-checkbox-stub" />' },
  TableCell: { template: '<div class="table-cell-stub"><slot /></div>' },
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>' },
  VcIcon: { template: '<i class="vc-icon-stub" />' },
  VcRadioButton: { template: '<div class="vc-radio-stub" />' },
  DynamicCellRenderer: { template: '<span class="dynamic-cell-stub" />' },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(DataTableCellRenderer, {
    props: {
      column: {
        instance: {},
        props: { id: "name", field: "name", type: "text" },
        slots: {},
      },
      item: { name: "Test" },
      editingRowData: { name: "Test" },
      index: 0,
      ...props,
    },
    global: {
      stubs,
      provide: {
        [ColumnCollectorKey as symbol]: { columns: [] },
      },
    },
  });
}

describe("DataTableCellRenderer", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("mounts the component", () => {
    const w = factory();
    expect(w.vm).toBeDefined();
  });

  describe("expander column", () => {
    const expanderColumn = {
      instance: {},
      props: { id: "expander", expander: true },
      slots: {},
    };

    it("renders expander button by default", () => {
      const w = factory({ column: expanderColumn });
      expect(w.html()).toContain("vc-button-stub");
    });

    it("renders expander button when canExpand is true", () => {
      const w = factory({ column: expanderColumn, canExpand: true });
      expect(w.html()).toContain("vc-button-stub");
    });

    it("hides expander button when canExpand is false", () => {
      const w = factory({ column: expanderColumn, canExpand: false });
      expect(w.html()).not.toContain("vc-button-stub");
    });
  });
});
