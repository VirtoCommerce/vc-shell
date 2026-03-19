import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcLink from "./vc-link.vue";

describe("VcLink", () => {
  const mountLink = (props = {}, slots = {}) =>
    mount(VcLink as any, { props, slots: { default: "Click me", ...slots } });

  it("renders as a button", () => {
    const w = mountLink();
    expect(w.find("button").exists()).toBe(true);
    expect(w.find("button").attributes("type")).toBe("button");
  });

  it("renders slot content", () => {
    expect(mountLink().text()).toBe("Click me");
  });

  it("emits click on click", async () => {
    const w = mountLink();
    await w.find("button").trigger("click");
    expect(w.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const w = mountLink({ disabled: true });
    await w.find("button").trigger("click");
    expect(w.emitted("click")).toBeUndefined();
  });

  it("sets disabled attribute", () => {
    const w = mountLink({ disabled: true });
    expect(w.find("button").attributes("disabled")).toBeDefined();
  });

  it("applies active class", () => {
    const w = mountLink({ active: true });
    expect(w.find(".vc-link--active").exists()).toBe(true);
  });

  it("applies disabled class", () => {
    const w = mountLink({ disabled: true });
    expect(w.find(".vc-link--disabled").exists()).toBe(true);
  });
});
