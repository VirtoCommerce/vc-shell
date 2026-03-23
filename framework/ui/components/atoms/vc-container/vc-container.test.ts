import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcContainer from "./vc-container.vue";

describe("VcContainer", () => {
  const mountComponent = (props = {}, slots = {}) => mount(VcContainer as any, { props, slots });

  describe("rendering", () => {
    it("renders with vc-container class", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-container").exists()).toBe(true);
    });

    it("renders inner container", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-container__inner").exists()).toBe(true);
    });

    it("renders default slot content", () => {
      const wrapper = mountComponent({}, { default: () => "Content" });
      expect(wrapper.find(".vc-container__inner").text()).toBe("Content");
    });
  });

  describe("element type", () => {
    it("renders as div by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.element.tagName).toBe("DIV");
    });

    it("renders as section when ariaLabel is provided", () => {
      const wrapper = mountComponent({ ariaLabel: "Main content" });
      expect(wrapper.element.tagName).toBe("SECTION");
      expect(wrapper.attributes("aria-label")).toBe("Main content");
    });
  });

  describe("noPadding", () => {
    it("applies nopadding class when noPadding is true", () => {
      const wrapper = mountComponent({ noPadding: true });
      expect(wrapper.find(".vc-container--nopadding").exists()).toBe(true);
    });

    it("does not apply nopadding class by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-container--nopadding").exists()).toBe(false);
    });
  });

  describe("scroll event", () => {
    it("emits scroll event when inner container is scrolled", async () => {
      const wrapper = mountComponent();
      await wrapper.find(".vc-container__inner").trigger("scroll");
      expect(wrapper.emitted("scroll")).toHaveLength(1);
    });
  });

  describe("expose", () => {
    it("exposes scrollTop method", () => {
      const wrapper = mountComponent();
      expect(typeof (wrapper.vm as any).scrollTop).toBe("function");
    });

    it("exposes component ref", () => {
      const wrapper = mountComponent();
      expect((wrapper.vm as any).component).toBeDefined();
    });
  });
});
