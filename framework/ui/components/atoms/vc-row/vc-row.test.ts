import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcRow from "./vc-row.vue";

describe("VcRow", () => {
  it("renders slot content", () => {
    const w = mount(VcRow as any, { slots: { default: "row content" } });
    expect(w.text()).toBe("row content");
  });

  it("has vc-row class", () => {
    const w = mount(VcRow as any, { slots: { default: "x" } });
    expect(w.find(".vc-row").exists()).toBe(true);
  });
});
