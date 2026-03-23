import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DataTableBody from "./DataTableBody.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  DataTableRow: { template: '<div class="data-table-row-stub"><slot /></div>' },
  TableGroupRow: { template: '<div class="table-group-row-stub" />' },
  TableEmpty: { template: '<div class="table-empty-stub"><slot /></div>' },
  TableSkeletonRows: { template: '<div class="skeleton-stub" />' },
  TransitionGroup: { template: "<div><slot /></div>" },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(DataTableBody, {
    props: {
      items: [{ id: 1, name: "A" }],
      columns: [],
      loading: false,
      getItemKey: (item: any, idx: number) => item?.id ?? idx,
      getRowProps: () => ({}),
      getColumnWidth: () => undefined,
      getCellStyle: () => undefined,
      isGroupExpanded: () => true,
      getGlobalIndex: (_item: any) => 0,
      ...props,
    },
    global: { stubs },
  });
}

describe("DataTableBody", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders vc-data-table__body class", () => {
    const w = factory();
    expect(w.find(".vc-data-table__body").exists()).toBe(true);
  });

  it("renders skeleton when loading", () => {
    const w = factory({ loading: true, items: [] });
    expect(w.find(".skeleton-stub").exists()).toBe(true);
  });

  it("renders empty state when no items and not loading", () => {
    const w = factory({ items: [], loading: false });
    expect(w.find(".table-empty-stub").exists()).toBe(true);
  });
});
