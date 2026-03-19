import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcStatus from "@ui/components/atoms/vc-status/vc-status.vue";

describe("VcStatus", () => {
  const mountComponent = (props = {}, slots = {}) =>
    mount(VcStatus as any, { props, slots });

  it("renders with role='status'", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("role")).toBe("status");
  });

  it("renders default slot content", () => {
    const wrapper = mountComponent({}, { default: () => "Active" });
    expect(wrapper.find(".vc-status__content").text()).toBe("Active");
  });

  it("applies info variant by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-status--info");
  });

  it("applies specified variant class", () => {
    const variants = ["info", "warning", "danger", "success", "light-danger", "info-dark", "primary"] as const;
    for (const variant of variants) {
      const wrapper = mountComponent({ variant });
      expect(wrapper.classes()).toContain(`vc-status--${variant}`);
    }
  });

  it("applies extended class when extend is true", () => {
    const wrapper = mountComponent({ extend: true });
    expect(wrapper.classes()).toContain("vc-status--extended");
  });

  it("does not apply extended class by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).not.toContain("vc-status--extended");
  });

  it("applies dot class when dot is true", () => {
    const wrapper = mountComponent({ dot: true });
    expect(wrapper.classes()).toContain("vc-status--dot");
  });

  it("does not apply dot class by default", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).not.toContain("vc-status--dot");
  });

  it("sets aria-label to variant name when dot is true", () => {
    const wrapper = mountComponent({ dot: true, variant: "success" });
    expect(wrapper.attributes("aria-label")).toBe("success");
  });

  it("does not set aria-label when dot is false", () => {
    const wrapper = mountComponent({ dot: false, variant: "success" });
    expect(wrapper.attributes("aria-label")).toBeUndefined();
  });
});
