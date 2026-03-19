import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableSkeletonRows from "./TableSkeletonRows.vue";

const stubs = {
  TableRow: { template: '<div class="table-row-stub"><slot /></div>' },
  TableCell: { template: '<div class="table-cell-stub"><slot /></div>', props: ["width", "lineClamp", "style"] },
  VcSkeleton: { template: '<div class="vc-skeleton-stub" />', props: ["variant", "width", "height"] },
};

const mockColumns = [
  { props: { id: "name", type: "text" } },
  { props: { id: "avatar", type: "image" } },
  { props: { id: "status", type: "status" } },
];

function factory(props: Record<string, unknown> = {}) {
  return mount(TableSkeletonRows, {
    props: {
      columns: mockColumns,
      rows: 3,
      getColumnWidth: () => undefined,
      getCellStyle: () => undefined,
      ...props,
    },
    global: { stubs },
  });
}

describe("TableSkeletonRows", () => {
  it("renders skeleton container", () => {
    const w = factory();
    expect(w.find(".vc-data-table__skeleton").exists()).toBe(true);
  });

  it("renders correct number of rows", () => {
    const w = factory({ rows: 5 });
    expect(w.findAll(".table-row-stub").length).toBe(5);
  });

  it("renders cells per column per row", () => {
    const w = factory({ rows: 2 });
    // 2 rows * 3 columns = 6 cells
    expect(w.findAll(".table-cell-stub").length).toBe(6);
  });

  it("renders skeletons per cell", () => {
    const w = factory({ rows: 1 });
    expect(w.findAll(".vc-skeleton-stub").length).toBe(3);
  });

  it("renders fallback skeleton rows when no columns", () => {
    const w = factory({ columns: [], rows: 3 });
    expect(w.findAll(".vc-data-table__skeleton-fallback-row").length).toBe(3);
  });

  it("shows selection cell when showSelectionCell=true", () => {
    const w = factory({ showSelectionCell: true, rows: 1 });
    // 3 data columns + 1 selection = 4 cells
    expect(w.findAll(".table-cell-stub").length).toBe(4);
  });
});
