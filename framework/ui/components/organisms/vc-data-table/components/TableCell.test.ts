import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableCell from "./TableCell.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(TableCell, {
    props,
    slots: { default: "Cell content", ...slots },
  });
}

describe("TableCell", () => {
  it("renders cell with role=cell", () => {
    const w = factory();
    expect(w.find("[role='cell']").exists()).toBe(true);
  });

  it("applies vc-table-composition__cell class", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__cell").exists()).toBe(true);
  });

  it("renders slot content", () => {
    const w = factory();
    expect(w.text()).toContain("Cell content");
  });

  it("sets width in style", () => {
    const w = factory({ width: "200px" });
    expect(w.find(".vc-table-composition__cell").attributes("style")).toContain("width: 200px");
  });

  it("sets flex: 0 0 <width> when width is provided", () => {
    const w = factory({ width: "100px" });
    expect(w.find(".vc-table-composition__cell").attributes("style")).toContain("flex: 0 0 100px");
  });

  it("uses flex: 1 1 0px fallback when width is not provided (initial render)", () => {
    // Before the engine computes, cells get a flex:1 fallback so they fill
    // the row evenly — prevents a left-pack visual glitch on first mount.
    const w = factory();
    const style = w.find(".vc-table-composition__cell").attributes("style") || "";
    expect(style).toContain("flex: 1 1 0px");
  });

  it("applies text alignment", () => {
    const w = factory({ align: "center" });
    expect(w.find(".vc-table-composition__cell").attributes("style")).toContain("text-align: center");
  });

  it("applies truncate class for lineClamp=1", () => {
    const w = factory({ lineClamp: 1 });
    expect(w.find(".vc-table-composition__cell-content--truncate").exists()).toBe(true);
  });

  it("applies line-clamp class for lineClamp>1", () => {
    const w = factory({ lineClamp: 3 });
    expect(w.find(".vc-table-composition__cell-content--line-clamp").exists()).toBe(true);
  });

  it("no clamp class for lineClamp=0", () => {
    const w = factory({ lineClamp: 0 });
    expect(w.find(".vc-table-composition__cell-content--truncate").exists()).toBe(false);
    expect(w.find(".vc-table-composition__cell-content--line-clamp").exists()).toBe(false);
  });

  it("default lineClamp is 2 (line-clamp class)", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__cell-content--line-clamp").exists()).toBe(true);
  });

  it("sets data-column-id attribute", () => {
    const w = factory({ columnId: "name" });
    expect(w.find(".vc-table-composition__cell").attributes("data-column-id")).toBe("name");
  });

  it("applies custom cellClass", () => {
    const w = factory({ cellClass: "my-custom-class" });
    expect(w.find(".vc-table-composition__cell").classes()).toContain("my-custom-class");
  });
});
