import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcProgress from "./vc-progress.vue";

describe("VcProgress", () => {
  const mountComponent = (props = {}) => mount(VcProgress as any, { props });

  describe("rendering", () => {
    it("renders with vc-progress class", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-progress").exists()).toBe(true);
    });

    it("renders value bar", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-progress__value").exists()).toBe(true);
    });
  });

  describe("value", () => {
    it("defaults to 0", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("aria-valuenow")).toBe("0");
      expect(wrapper.find(".vc-progress__value").attributes("style")).toContain("translateX(-100%)");
    });

    it("sets progress to given value", () => {
      const wrapper = mountComponent({ value: 50 });
      expect(wrapper.attributes("aria-valuenow")).toBe("50");
      expect(wrapper.find(".vc-progress__value").attributes("style")).toContain("translateX(-50%)");
    });

    it("sets 100% progress", () => {
      const wrapper = mountComponent({ value: 100 });
      expect(wrapper.attributes("aria-valuenow")).toBe("100");
      // 100 - 100 = 0, rendered as -0% by the template
      const style = wrapper.find(".vc-progress__value").attributes("style") || "";
      expect(style).toMatch(/translateX\(-?0%\)/);
    });

    it("clamps value below 0 to 0", () => {
      const wrapper = mountComponent({ value: -10 });
      expect(wrapper.attributes("aria-valuenow")).toBe("0");
    });

    it("clamps value above 100 to 100", () => {
      const wrapper = mountComponent({ value: 150 });
      expect(wrapper.attributes("aria-valuenow")).toBe("100");
    });
  });

  describe("variant", () => {
    it("does not apply striped class by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-progress--striped").exists()).toBe(false);
    });

    it("applies striped class", () => {
      const wrapper = mountComponent({ variant: "striped" });
      expect(wrapper.find(".vc-progress--striped").exists()).toBe(true);
    });
  });

  describe("accessibility", () => {
    it("has role=progressbar", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("role")).toBe("progressbar");
    });

    it("has aria-valuemin=0", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("aria-valuemin")).toBe("0");
    });

    it("has aria-valuemax=100", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("aria-valuemax")).toBe("100");
    });

    it("has default aria-label", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("aria-label")).toBe("Progress");
    });

    it("uses custom aria-label", () => {
      const wrapper = mountComponent({ ariaLabel: "Upload progress" });
      expect(wrapper.attributes("aria-label")).toBe("Upload progress");
    });
  });
});
