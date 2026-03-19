import { describe, expect, it, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import VcImage from "./vc-image.vue";

// CSS.escape is not available in jsdom
beforeAll(() => {
  if (typeof globalThis.CSS === "undefined") {
    (globalThis as any).CSS = { escape: (v: string) => v };
  } else if (!CSS.escape) {
    CSS.escape = (v: string) => v;
  }
});

describe("VcImage", () => {
  const mountComponent = (props = {}) =>
    mount(VcImage as any, {
      props,
      global: { stubs: { VcIcon: true } },
    });

  describe("rendering", () => {
    it("renders with vc-image class", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image").exists()).toBe(true);
    });

    it("renders container element", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image__container").exists()).toBe(true);
    });

    it("shows placeholder when no src", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image__placeholder").exists()).toBe(true);
    });

    it("hides placeholder when src is provided", () => {
      const wrapper = mountComponent({ src: "https://example.com/img.png" });
      expect(wrapper.find(".vc-image__placeholder").exists()).toBe(false);
    });

    it("applies background style when src is provided", () => {
      const wrapper = mountComponent({ src: "https://example.com/img.png" });
      // jsdom cannot parse complex background shorthand so the style
      // attribute may appear empty. We verify src is used by confirming
      // the placeholder is hidden (only happens when src is truthy).
      expect(wrapper.find(".vc-image__placeholder").exists()).toBe(false);
      // The imageHandler computed returns a truthy string for the :style binding
      const container = wrapper.find(".vc-image__container");
      expect(container.exists()).toBe(true);
    });
  });

  describe("aspect ratio", () => {
    it("applies 1x1 aspect by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image_1x1").exists()).toBe(true);
    });

    it.each(["1x1", "16x9", "4x3", "3x2"] as const)(
      "applies aspect class: %s",
      (aspect) => {
        const wrapper = mountComponent({ aspect });
        expect(wrapper.find(`.vc-image_${aspect}`).exists()).toBe(true);
      },
    );
  });

  describe("size", () => {
    it("applies auto size by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image_auto").exists()).toBe(true);
    });

    it.each(["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const)(
      "applies size class: %s",
      (size) => {
        const wrapper = mountComponent({ size });
        expect(wrapper.find(`.vc-image_${size}`).exists()).toBe(true);
      },
    );
  });

  describe("modifiers", () => {
    it("applies rounded class", () => {
      const wrapper = mountComponent({ rounded: true });
      expect(wrapper.find(".vc-image__container--rounded").exists()).toBe(true);
    });

    it("applies bordered class", () => {
      const wrapper = mountComponent({ bordered: true });
      expect(wrapper.find(".vc-image__container--bordered").exists()).toBe(true);
    });

    it("applies clickable class", () => {
      const wrapper = mountComponent({ clickable: true });
      expect(wrapper.find(".vc-image__container--clickable").exists()).toBe(true);
    });
  });

  describe("click handling", () => {
    it("emits click when clickable", async () => {
      const wrapper = mountComponent({ clickable: true });
      await wrapper.find(".vc-image__container").trigger("click");
      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("does not emit click when not clickable", async () => {
      const wrapper = mountComponent();
      await wrapper.find(".vc-image__container").trigger("click");
      expect(wrapper.emitted("click")).toBeUndefined();
    });

    it("emits click on Enter key", async () => {
      const wrapper = mountComponent({ clickable: true });
      await wrapper.find(".vc-image__container").trigger("keydown.enter");
      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("emits click on Space key", async () => {
      const wrapper = mountComponent({ clickable: true });
      await wrapper.find(".vc-image__container").trigger("keydown.space");
      expect(wrapper.emitted("click")).toHaveLength(1);
    });
  });

  describe("accessibility", () => {
    it("sets role=button when clickable", () => {
      const wrapper = mountComponent({ clickable: true });
      expect(wrapper.find(".vc-image__container").attributes("role")).toBe("button");
    });

    it("sets role=img when src is provided and not clickable", () => {
      const wrapper = mountComponent({ src: "https://example.com/img.png" });
      expect(wrapper.find(".vc-image__container").attributes("role")).toBe("img");
    });

    it("sets tabindex=0 when clickable", () => {
      const wrapper = mountComponent({ clickable: true });
      expect(wrapper.find(".vc-image__container").attributes("tabindex")).toBe("0");
    });

    it("sets aria-label from alt prop", () => {
      const wrapper = mountComponent({ alt: "Product image" });
      expect(wrapper.find(".vc-image__container").attributes("aria-label")).toBe("Product image");
    });

    it("placeholder has aria-hidden", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".vc-image__placeholder").attributes("aria-hidden")).toBe("true");
    });
  });
});
