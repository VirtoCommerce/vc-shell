import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableBody from "./TableBody.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  return mount(TableBody, { props, slots });
}

describe("TableBody", () => {
  it("renders body with role=rowgroup", () => {
    const w = factory({ items: [1, 2] }, { default: "<div>rows</div>" });
    expect(w.find("[role='rowgroup']").exists()).toBe(true);
  });

  it("applies vc-table-composition__body class", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__body").exists()).toBe(true);
  });

  it("shows slot content when items are provided and not loading", () => {
    const w = factory({ items: [{ id: 1 }], loading: false }, { default: "<div class='row'>Row</div>" });
    expect(w.find(".row").exists()).toBe(true);
  });

  it("shows empty state when items is empty and not loading", () => {
    const w = factory({ items: [], loading: false });
    expect(w.find(".vc-table-composition__empty").exists()).toBe(true);
  });

  it("shows loading state when loading=true", () => {
    const w = factory({ loading: true, items: [] });
    expect(w.find(".vc-table-composition__loading").exists()).toBe(true);
  });

  it("renders custom empty slot", () => {
    const w = factory({ items: [], loading: false }, { empty: "<div class='custom-empty'>Nothing here</div>" });
    expect(w.find(".custom-empty").exists()).toBe(true);
  });

  it("renders custom loading slot", () => {
    const w = factory({ loading: true }, { loading: "<div class='custom-loading'>Wait...</div>" });
    expect(w.find(".custom-loading").exists()).toBe(true);
  });

  it("sets data-items-count attribute", () => {
    const w = factory({ items: [1, 2, 3] }, { default: "<div>rows</div>" });
    expect(w.find(".vc-table-composition__body").attributes("data-items-count")).toBe("3");
  });
});
