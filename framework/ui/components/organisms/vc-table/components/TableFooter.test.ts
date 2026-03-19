import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableFooter from "./TableFooter.vue";

describe("TableFooter", () => {
  it("renders footer container", () => {
    const w = mount(TableFooter);
    expect(w.find(".vc-table-composition__footer").exists()).toBe(true);
  });

  it("renders slot content", () => {
    const w = mount(TableFooter, {
      slots: { default: "<span>Page 1 of 5</span>" },
    });
    expect(w.text()).toContain("Page 1 of 5");
  });
});
