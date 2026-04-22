import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcBanner from "./vc-banner.vue";

describe("VcBanner", () => {
  const mountBanner = (props = {}, slots = {}) =>
    mount(VcBanner as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
    });

  it("renders with default variant info", () => {
    const w = mountBanner({}, { default: "Content" });
    expect(w.find(".vc-banner--info").exists()).toBe(true);
  });

  it("applies variant class", () => {
    const w = mountBanner({ variant: "danger" }, { default: "Error" });
    expect(w.find(".vc-banner--danger").exists()).toBe(true);
  });

  it("maps legacy variant light-danger to danger", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const w = mountBanner({ variant: "light-danger" }, { default: "x" });
    expect(w.find(".vc-banner--danger").exists()).toBe(true);
    warnSpy.mockRestore();
  });

  it("sets role=alert for danger variant", () => {
    const w = mountBanner({ variant: "danger" }, { default: "x" });
    expect(w.find(".vc-banner").attributes("role")).toBe("alert");
  });

  it("sets role=region for info variant", () => {
    const w = mountBanner({ variant: "info" }, { default: "x" });
    expect(w.find(".vc-banner").attributes("role")).toBe("region");
  });

  it("renders title slot", () => {
    const w = mountBanner({}, { title: "Title", default: "Body" });
    expect(w.find(".vc-banner__title").text()).toBe("Title");
  });

  it("renders content slot", () => {
    const w = mountBanner({}, { default: "Body text" });
    expect(w.find(".vc-banner__content").text()).toBe("Body text");
  });

  it("applies title-only class when no default slot", () => {
    const w = mountBanner({}, { title: "Only title" });
    expect(w.find(".vc-banner--title-only").exists()).toBe(true);
  });
});
