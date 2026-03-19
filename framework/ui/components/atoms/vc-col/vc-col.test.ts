import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcCol from "./vc-col.vue";

describe("VcCol", () => {
  it("renders slot content", () => {
    const w = mount(VcCol as any, { slots: { default: "content" } });
    expect(w.text()).toBe("content");
  });

  it("has vc-col class", () => {
    const w = mount(VcCol as any, { slots: { default: "x" } });
    expect(w.find(".vc-col").exists()).toBe(true);
  });

  it("defaults flexGrow to 1", () => {
    const w = mount(VcCol as any, { slots: { default: "x" } });
    expect(w.find(".vc-col").attributes("style")).toContain("flex-grow: 1");
  });

  it("sets flexGrow from size prop", () => {
    const w = mount(VcCol as any, { props: { size: 3 }, slots: { default: "x" } });
    expect(w.find(".vc-col").attributes("style")).toContain("flex-grow: 3");
  });
});
