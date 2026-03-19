import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcHint from "./vc-hint.vue";

describe("VcHint", () => {
  it("renders slot content", () => {
    const w = mount(VcHint as any, { slots: { default: "Hint text" } });
    expect(w.text()).toBe("Hint text");
  });

  it("has vc-hint class", () => {
    const w = mount(VcHint as any, { slots: { default: "x" } });
    expect(w.find(".vc-hint").exists()).toBe(true);
  });

  it("applies error class when error=true", () => {
    const w = mount(VcHint as any, { props: { error: true }, slots: { default: "x" } });
    expect(w.find(".vc-hint--error").exists()).toBe(true);
  });

  it("sets role=alert when error", () => {
    const w = mount(VcHint as any, { props: { error: true }, slots: { default: "x" } });
    expect(w.find(".vc-hint").attributes("role")).toBe("alert");
  });

  it("does not set role when not error", () => {
    const w = mount(VcHint as any, { slots: { default: "x" } });
    expect(w.find(".vc-hint").attributes("role")).toBeUndefined();
  });

  it("sets id attribute", () => {
    const w = mount(VcHint as any, { props: { id: "hint-1" }, slots: { default: "x" } });
    expect(w.find(".vc-hint").attributes("id")).toBe("hint-1");
  });
});
