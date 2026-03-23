import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcLoading from "./vc-loading.vue";

describe("VcLoading", () => {
  const mountComponent = (props = {}) => mount(VcLoading as any, { props });

  describe("rendering", () => {
    it("renders with vc-loading-overlay class", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-loading-overlay").exists()).toBe(true);
    });

    it("renders loading bar", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-loading-overlay__bar").exists()).toBe(true);
      expect(wrapper.find(".vc-loading-overlay__bar-fill").exists()).toBe(true);
    });
  });

  describe("active state", () => {
    it("applies active class when active is true", () => {
      const wrapper = mountComponent({ active: true });
      expect(wrapper.find(".vc-loading-overlay--active").exists()).toBe(true);
    });

    it("does not apply active class by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-loading-overlay--active").exists()).toBe(false);
    });
  });

  describe("accessibility", () => {
    it("has role=status", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("role")).toBe("status");
    });

    it("sets aria-busy=true when active", () => {
      const wrapper = mountComponent({ active: true });
      expect(wrapper.attributes("aria-busy")).toBe("true");
    });

    it("sets aria-busy=false when not active", () => {
      const wrapper = mountComponent({ active: false });
      expect(wrapper.attributes("aria-busy")).toBe("false");
    });

    it("has aria-live=polite", () => {
      const wrapper = mountComponent();
      expect(wrapper.attributes("aria-live")).toBe("polite");
    });

    it("shows sr-only loading text when active", () => {
      const wrapper = mountComponent({ active: true });
      expect(wrapper.find(".tw-sr-only").text()).toBe("Loading...");
    });

    it("hides sr-only text when not active", () => {
      const wrapper = mountComponent({ active: false });
      expect(wrapper.find(".tw-sr-only").text()).toBe("");
    });
  });
});
