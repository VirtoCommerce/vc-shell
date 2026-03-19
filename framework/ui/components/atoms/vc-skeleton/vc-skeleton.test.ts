import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcSkeleton from "@ui/components/atoms/vc-skeleton/vc-skeleton.vue";

describe("VcSkeleton", () => {
  const mountComponent = (props = {}) =>
    mount(VcSkeleton as any, { props });

  it("renders text variant by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-skeleton").exists()).toBe(true);
  });

  it("renders with role='status' and aria-busy", () => {
    const wrapper = mountComponent();
    const el = wrapper.find("[role='status']");
    expect(el.exists()).toBe(true);
    expect(el.attributes("aria-busy")).toBe("true");
  });

  it("renders default aria-label 'Loading...'", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("[role='status']").attributes("aria-label")).toBe("Loading...");
  });

  it("renders custom aria-label", () => {
    const wrapper = mountComponent({ ariaLabel: "Please wait" });
    expect(wrapper.find("[role='status']").attributes("aria-label")).toBe("Please wait");
  });

  it("renders screen reader text", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".tw-sr-only").text()).toBe("Loading...");
  });

  it("renders 1 row by default for text variant", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll(".vc-skeleton__row").length).toBe(1);
  });

  it("renders multiple rows when rows prop is set", () => {
    const wrapper = mountComponent({ rows: 3 });
    expect(wrapper.findAll(".vc-skeleton__row").length).toBe(3);
  });

  it("last row has 60% width, others have 100%", () => {
    const wrapper = mountComponent({ rows: 3 });
    const rows = wrapper.findAll(".vc-skeleton__row");
    expect(rows[0].attributes("style")).toContain("width: 100%");
    expect(rows[1].attributes("style")).toContain("width: 100%");
    expect(rows[2].attributes("style")).toContain("width: 60%");
  });

  it("single row has 60% width (it is the last row)", () => {
    const wrapper = mountComponent({ rows: 1 });
    const row = wrapper.find(".vc-skeleton__row");
    expect(row.attributes("style")).toContain("width: 60%");
  });

  it("applies animated class by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-skeleton--animated").exists()).toBe(true);
  });

  it("does not apply animated class when animated is false", () => {
    const wrapper = mountComponent({ animated: false });
    expect(wrapper.find(".vc-skeleton--animated").exists()).toBe(false);
  });

  it("renders circle variant", () => {
    const wrapper = mountComponent({ variant: "circle" });
    expect(wrapper.find(".vc-skeleton__shape--circle").exists()).toBe(true);
    expect(wrapper.find(".vc-skeleton__row").exists()).toBe(false);
  });

  it("renders block variant", () => {
    const wrapper = mountComponent({ variant: "block" });
    expect(wrapper.find(".vc-skeleton__shape--block").exists()).toBe(true);
  });

  it("applies width and height as px for number values", () => {
    const wrapper = mountComponent({ variant: "block", width: 100, height: 50 });
    const shape = wrapper.find(".vc-skeleton__shape");
    expect(shape.attributes("style")).toContain("width: 100px");
    expect(shape.attributes("style")).toContain("height: 50px");
  });

  it("applies width and height as-is for string values", () => {
    const wrapper = mountComponent({ variant: "block", width: "50%", height: "10rem" });
    const shape = wrapper.find(".vc-skeleton__shape");
    expect(shape.attributes("style")).toContain("width: 50%");
    expect(shape.attributes("style")).toContain("height: 10rem");
  });

  it("circle variant has animate-pulse when animated", () => {
    const wrapper = mountComponent({ variant: "circle", animated: true });
    expect(wrapper.find(".vc-skeleton__shape").classes()).toContain("tw-animate-pulse");
  });

  it("circle variant does not have animate-pulse when not animated", () => {
    const wrapper = mountComponent({ variant: "circle", animated: false });
    expect(wrapper.find(".vc-skeleton__shape").classes()).not.toContain("tw-animate-pulse");
  });
});
