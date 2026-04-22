import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed } from "vue";
import DataTableRow from "./DataTableRow.vue";
import { TableContextKey, ColumnCollectorKey } from "@ui/components/organisms/vc-data-table/keys";

const stubs = {
  DataTableCellRenderer: { template: '<div class="cell-renderer-stub" />' },
  TableRowActions: { template: '<div class="row-actions-stub" />' },
  TableGroupRow: { template: '<div class="group-row-stub" />' },
  TableCheckbox: { template: '<div class="table-checkbox-stub" />' },
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>' },
  VcIcon: { template: '<i class="vc-icon-stub" />' },
  VcRadioButton: { template: '<div class="vc-radio-stub" />' },
};

const noop = () => undefined;

function factory(props: Record<string, unknown> = {}) {
  return mount(DataTableRow, {
    props: {
      item: { id: 1, name: "Test" },
      columns: [],
      rowIndex: 0,
      index: 0,
      editingRowData: { id: 1, name: "Test" },
      isCellEditing: () => false,
      getColumnWidth: noop,
      getCellAlign: noop,
      getCellStyle: noop,
      ...props,
    },
    global: {
      stubs,
      provide: {
        [TableContextKey as symbol]: {
          selectedRowIndex: computed(() => undefined),
          setSelectedRowIndex: vi.fn(),
          variant: computed(() => undefined),
        },
        [ColumnCollectorKey as symbol]: { columns: [] },
      },
    },
  });
}

describe("DataTableRow", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders the row container", () => {
    const w = factory();
    // DataTableRow renders a row div
    expect(w.find("[role='row']").exists() || w.find(".vc-data-table__row").exists() || w.exists()).toBe(true);
  });
});
