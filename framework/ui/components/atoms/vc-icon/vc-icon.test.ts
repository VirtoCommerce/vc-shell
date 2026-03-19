import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcIcon from "./vc-icon.vue";

describe("VcIcon", () => {
  const mountComponent = (props = {}) =>
    mount(VcIcon as any, {
      props,
      global: {
        stubs: {
          VcLucideIcon: { template: '<i class="vc-lucide-icon-stub"></i>', props: ["icon", "size", "variant", "strokeWidth", "customSize"] },
          VcMaterialIcon: { template: '<i class="vc-material-icon-stub"></i>', props: ["icon", "size", "variant", "type", "fill", "weight", "grade", "customSize"] },
          VcBootstrapIcon: { template: '<i class="vc-bootstrap-icon-stub"></i>', props: ["icon", "size", "variant", "customSize"] },
          VcFontawesomeIcon: { template: '<i class="vc-fontawesome-icon-stub"></i>', props: ["icon", "size", "variant", "customSize"] },
          VcSvgIcon: { template: '<i class="vc-svg-icon-stub"></i>', props: ["icon", "size", "variant", "customSize", "basePath"] },
        },
      },
    });

  describe("rendering", () => {
    it("renders with vc-icon class", () => {
      const wrapper = mountComponent({ icon: "lucide-home" });
      expect(wrapper.find(".vc-icon").exists()).toBe(true);
    });

    it("renders lucide icon by default", () => {
      const wrapper = mountComponent();
      // Default icon is "lucide-square"
      expect(wrapper.find(".vc-lucide-icon-stub").exists()).toBe(true);
    });
  });

  describe("icon type detection", () => {
    it("detects lucide icons from prefix", () => {
      const wrapper = mountComponent({ icon: "lucide-home" });
      expect(wrapper.find(".vc-lucide-icon-stub").exists()).toBe(true);
    });

    it("detects material icons from prefix", () => {
      const wrapper = mountComponent({ icon: "material-home" });
      expect(wrapper.find(".vc-material-icon-stub").exists()).toBe(true);
    });

    it("detects bootstrap icons from prefix", () => {
      const wrapper = mountComponent({ icon: "bi-house" });
      expect(wrapper.find(".vc-bootstrap-icon-stub").exists()).toBe(true);
    });

    it("detects fontawesome icons from prefix", () => {
      const wrapper = mountComponent({ icon: "fa-home" });
      expect(wrapper.find(".vc-fontawesome-icon-stub").exists()).toBe(true);
    });

    it("detects svg icons from prefix", () => {
      const wrapper = mountComponent({ icon: "svg:path/to/icon.svg" });
      expect(wrapper.find(".vc-svg-icon-stub").exists()).toBe(true);
    });
  });

  describe("size", () => {
    it("applies default size class (m)", () => {
      const wrapper = mountComponent({ icon: "lucide-home" });
      expect(wrapper.find(".vc-icon--m").exists()).toBe(true);
    });

    it.each(["xs", "s", "m", "l", "xl", "xxl", "xxxl"] as const)(
      "applies size class: %s",
      (size) => {
        const wrapper = mountComponent({ icon: "lucide-home", size });
        expect(wrapper.find(`.vc-icon--${size}`).exists()).toBe(true);
      },
    );
  });

  describe("variant", () => {
    it.each(["warning", "danger", "success"] as const)(
      "applies variant class: %s",
      (variant) => {
        const wrapper = mountComponent({ icon: "lucide-home", variant });
        expect(wrapper.find(`.vc-icon--${variant}`).exists()).toBe(true);
      },
    );
  });

  describe("container", () => {
    it("wraps in container when useContainer is true", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const wrapper = mountComponent({ icon: "lucide-home", useContainer: true });
      expect(wrapper.find(".vc-icon-container").exists()).toBe(true);
      warnSpy.mockRestore();
    });

    it("does not use container by default", () => {
      const wrapper = mountComponent({ icon: "lucide-home" });
      expect(wrapper.find(".vc-icon-container").exists()).toBe(false);
    });
  });

  describe("accessibility", () => {
    it("sets aria-hidden=true by default (decorative)", () => {
      const wrapper = mountComponent({ icon: "lucide-home" });
      expect(wrapper.attributes("aria-hidden")).toBe("true");
    });

    it("sets aria-label and role=img when ariaLabel is provided", () => {
      const wrapper = mountComponent({ icon: "lucide-home", ariaLabel: "Home" });
      expect(wrapper.attributes("aria-label")).toBe("Home");
      expect(wrapper.attributes("role")).toBe("img");
      expect(wrapper.attributes("aria-hidden")).toBeUndefined();
    });
  });
});
