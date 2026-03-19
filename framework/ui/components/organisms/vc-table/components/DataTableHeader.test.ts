import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DataTableHeader from "./DataTableHeader.vue";
import { ColumnCollectorKey } from "@ui/components/organisms/vc-table/keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  TableHeader: { template: '<div class="table-header-stub"><slot /></div>' },
  TableHead: { template: '<div class="table-head-stub"><slot /></div>' },
  TableCheckbox: { template: '<div class="table-checkbox-stub" />' },
  ColumnFilter: { template: '<div class="column-filter-stub" />' },
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>' },
  VcIcon: { template: '<i class="vc-icon-stub" />' },
  VcRadioButton: { template: '<div class="vc-radio-stub" />' },
  TableColumnSwitcher: { template: '<div class="column-switcher-stub" />' },
};

const noop = () => undefined;

function factory(props: Record<string, unknown> = {}) {
  return mount(DataTableHeader, {
    props: {
      columns: [],
      setHeaderRef: noop,
      getSortDirection: noop,
      getSortIndex: noop,
      getSortField: noop,
      getColumnWidth: noop,
      getHeaderAlign: noop,
      getHeaderStyle: noop,
      isColumnResizable: () => false,
      isColumnReorderable: () => false,
      isLastResizable: () => false,
      showFilter: () => false,
      getFilterType: noop,
      getFilterOptions: () => [],
      isFilterMultiple: () => false,
      getRangeFields: noop,
      getFilterValue: noop,
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

describe("DataTableHeader", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders header wrapper", () => {
    const w = factory();
    expect(w.find(".table-header-stub").exists()).toBe(true);
  });
});
