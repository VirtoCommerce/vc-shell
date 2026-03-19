import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcBadge from "./vc-badge.vue";

describe("VcBadge", () => {
  const mountBadge = (props = {}, slots = {}) =>
    mount(VcBadge as any, { props, slots });

  it("renders badge with content", () => {
    const w = mountBadge({ content: "5" });
    expect(w.find(".vc-badge__text").text()).toBe("5");
  });

  it("renders default slot in standard mode", () => {
    const w = mountBadge({ content: "3" }, { default: "<span>child</span>" });
    expect(w.find(".vc-badge__content").exists()).toBe(true);
  });

  it("renders inline mode when inline=true", () => {
    const w = mountBadge({ content: "1", inline: true });
    expect(w.find(".vc-badge__badge--inline").exists()).toBe(true);
  });

  it("applies variant class", () => {
    const w = mountBadge({ content: "1", variant: "danger" });
    expect(w.find(".vc-badge__badge--danger").exists()).toBe(true);
  });

  it("renders dot mode without text", () => {
    const w = mountBadge({ isDot: true });
    expect(w.find(".vc-badge__badge--dot").exists()).toBe(true);
    expect(w.find(".vc-badge__text").exists()).toBe(false);
  });

  it("emits click when clickable", async () => {
    const w = mountBadge({ content: "1", clickable: true });
    await w.find(".vc-badge__badge").trigger("click");
    expect(w.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const w = mountBadge({ content: "1", clickable: true, disabled: true });
    await w.find(".vc-badge__badge").trigger("click");
    expect(w.emitted("click")).toBeUndefined();
  });

  it("sets role=button when clickable", () => {
    const w = mountBadge({ content: "1", clickable: true });
    expect(w.find(".vc-badge__badge").attributes("role")).toBe("button");
  });

  it("applies size class", () => {
    const w = mountBadge({ content: "1", inline: true, size: "s" });
    expect(w.find(".vc-badge__badge--inline-small").exists()).toBe(true);
  });
});
