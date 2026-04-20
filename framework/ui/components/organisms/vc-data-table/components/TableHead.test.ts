import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableHead from "./TableHead.vue";

const stubs = {
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableHead, {
    props,
    slots: { default: "Column Title" },
    global: { stubs },
  });
}

describe("TableHead", () => {
  it("renders with role columnheader", () => {
    const w = factory();
    expect(w.find("[role='columnheader']").exists()).toBe(true);
  });

  it("applies vc-table-composition__head class", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__head").exists()).toBe(true);
  });

  it("renders slot content", () => {
    const w = factory();
    expect(w.text()).toContain("Column Title");
  });

  it("applies sortable class when sortable", () => {
    const w = factory({ sortable: true });
    expect(w.find(".vc-table-composition__head--sortable").exists()).toBe(true);
  });

  it("applies sorted class when sortDirection is set", () => {
    const w = factory({ sortable: true, sortDirection: "asc" });
    expect(w.find(".vc-table-composition__head--sorted").exists()).toBe(true);
  });

  it("shows sort icons when sortable", () => {
    const w = factory({ sortable: true });
    expect(w.find(".vc-table-composition__head-sort").exists()).toBe(true);
  });

  it("hides sort icons when not sortable", () => {
    const w = factory({ sortable: false });
    expect(w.find(".vc-table-composition__head-sort").exists()).toBe(false);
  });

  it("emits sort on click when sortable", async () => {
    const w = factory({ sortable: true });
    await w.find(".vc-table-composition__head").trigger("click");
    expect(w.emitted("sort")).toBeTruthy();
  });

  it("does not emit sort on click when not sortable", async () => {
    const w = factory({ sortable: false });
    await w.find(".vc-table-composition__head").trigger("click");
    expect(w.emitted("sort")).toBeFalsy();
  });

  it("sets aria-sort ascending", () => {
    const w = factory({ sortable: true, sortDirection: "asc" });
    expect(w.find("[role='columnheader']").attributes("aria-sort")).toBe("ascending");
  });

  it("sets aria-sort descending", () => {
    const w = factory({ sortable: true, sortDirection: "desc" });
    expect(w.find("[role='columnheader']").attributes("aria-sort")).toBe("descending");
  });

  it("sets aria-sort none when sortable but unsorted", () => {
    const w = factory({ sortable: true });
    expect(w.find("[role='columnheader']").attributes("aria-sort")).toBe("none");
  });

  it("has no aria-sort when not sortable", () => {
    const w = factory({ sortable: false });
    expect(w.find("[role='columnheader']").attributes("aria-sort")).toBeUndefined();
  });

  it("sets tabindex=0 when sortable", () => {
    const w = factory({ sortable: true });
    expect(w.find("[role='columnheader']").attributes("tabindex")).toBe("0");
  });

  it("shows resizer when resizable", () => {
    const w = factory({ resizable: true });
    expect(w.find(".vc-table-composition__head-resizer").exists()).toBe(true);
  });

  it("applies reorderable class and draggable attribute", () => {
    const w = factory({ reorderable: true });
    expect(w.find(".vc-table-composition__head--reorderable").exists()).toBe(true);
    expect(w.find(".vc-table-composition__head").attributes("draggable")).toBe("true");
  });

  it("sets width in style", () => {
    const w = factory({ width: "150px" });
    expect(w.find(".vc-table-composition__head").attributes("style")).toContain("width: 150px");
  });

  it("shows sort badge when sortIndex is provided", () => {
    const w = factory({ sortable: true, sortDirection: "asc", sortIndex: 2 });
    expect(w.find(".vc-table-composition__head-sort-badge").text()).toBe("2");
  });

  it("emits resizeStart on resizer mousedown", async () => {
    const w = factory({ resizable: true, columnId: "col1" });
    await w.find(".vc-table-composition__head-resizer").trigger("mousedown");
    expect(w.emitted("resizeStart")).toBeTruthy();
  });
});
