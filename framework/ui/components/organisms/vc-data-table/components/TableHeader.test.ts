import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableHeader from "./TableHeader.vue";

describe("TableHeader", () => {
  it("renders header container with role rowgroup", () => {
    const w = mount(TableHeader);
    expect(w.find("[role='rowgroup']").exists()).toBe(true);
  });

  it("applies vc-table-composition__header class", () => {
    const w = mount(TableHeader);
    expect(w.find(".vc-table-composition__header").exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const w = mount(TableHeader, {
      slots: { default: "<div>Column headers</div>" },
    });
    expect(w.text()).toContain("Column headers");
  });
});
