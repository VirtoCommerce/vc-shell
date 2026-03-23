import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import SettingsMenuItem from "./settings-menu-item.vue";
import { IsMobileKey } from "@framework/injection-keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

const stubs = {
  VcIcon: { template: '<i data-stub="VcIcon" />', props: ["icon", "size", "customSize"] },
  VcImage: { template: '<img data-stub="VcImage" />', props: ["src", "emptyIcon"] },
  VcDropdownPanel: {
    template: '<div data-stub="VcDropdownPanel" v-if="show"><slot /></div>',
    props: ["show", "anchorRef", "placement", "width", "maxWidth"],
    emits: ["update:show"],
  },
};

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}, isMobile = false) {
  return mount(SettingsMenuItem, {
    props: { title: "Test Item", ...props },
    slots,
    global: {
      stubs,
      provide: { [IsMobileKey as symbol]: ref(isMobile) },
    },
  });
}

describe("SettingsMenuItem", () => {
  it("renders with title prop", () => {
    const w = factory({ title: "My Title" });
    expect(w.text()).toContain("My Title");
  });

  it("renders icon when icon prop is set", () => {
    const w = factory({ icon: "lucide-key" });
    expect(w.find('[data-stub="VcIcon"]').exists()).toBe(true);
  });

  it("renders image when image prop is set and no icon", () => {
    const w = factory({ image: "/img.png" });
    expect(w.find('[data-stub="VcImage"]').exists()).toBe(true);
  });

  it("renders value when value prop is set", () => {
    const w = factory({ value: "English" });
    expect(w.text()).toContain("English");
  });

  it("renders chevron when showChevron is true", () => {
    const w = factory({ showChevron: true });
    const icons = w.findAll('[data-stub="VcIcon"]');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it("emits trigger:click on click", async () => {
    const w = factory();
    await w.find(".vc-menu-item__trigger").trigger("click");
    expect(w.emitted("trigger:click")).toHaveLength(1);
  });

  it("does not emit trigger:click when disabled", async () => {
    const w = factory({ disabled: true });
    await w.find(".vc-menu-item__trigger").trigger("click");
    expect(w.emitted("trigger:click")).toBeUndefined();
  });

  it("does not emit when triggerAction is none", async () => {
    const w = factory({ triggerAction: "none" });
    await w.find(".vc-menu-item__trigger").trigger("click");
    expect(w.emitted("trigger:click")).toBeUndefined();
  });

  it("applies active class when isActive is true", () => {
    const w = factory({ isActive: true });
    expect(w.find(".vc-menu-item").classes()).toContain("vc-menu-item--active");
  });

  it("applies invisible class when isVisible is false", () => {
    const w = factory({ isVisible: false });
    expect(w.find(".vc-menu-item").classes()).toContain("vc-menu-item--invisible");
  });

  it("is visible by default", () => {
    const w = factory();
    expect(w.find(".vc-menu-item").classes()).not.toContain("vc-menu-item--invisible");
  });

  it("renders trigger slot when provided", () => {
    const w = factory({}, { trigger: '<span class="custom-trigger">Custom</span>' });
    expect(w.find(".custom-trigger").exists()).toBe(true);
  });

  it("renders content slot", () => {
    const w = factory({}, { content: '<div class="sub-content">Sub</div>' });
    expect(w.find(".sub-content").exists()).toBe(true);
  });

  describe("submenu slot", () => {
    const submenuSlot = '<div class="submenu-item">Option A</div>';

    it("shows chevron when submenu slot is provided", () => {
      const w = factory({}, { submenu: submenuSlot });
      const icons = w.findAll('[data-stub="VcIcon"]');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it("desktop: renders VcDropdownPanel for submenu", async () => {
      const w = factory({}, { submenu: submenuSlot }, false);
      await w.find(".vc-menu-item__trigger").trigger("click");
      expect(w.find('[data-stub="VcDropdownPanel"]').exists()).toBe(true);
      expect(w.find(".submenu-item").exists()).toBe(true);
    });

    it("mobile: renders inline submenu wrapper", async () => {
      const w = factory({}, { submenu: submenuSlot }, true);
      expect(w.find(".vc-menu-item__submenu-wrapper").exists()).toBe(true);
      expect(w.find('[data-stub="VcDropdownPanel"]').exists()).toBe(false);
    });

    it("mobile: expands submenu on trigger click", async () => {
      const w = factory({}, { submenu: submenuSlot }, true);
      expect(w.find(".vc-menu-item__submenu-content").exists()).toBe(true);
      await w.find(".vc-menu-item__trigger").trigger("click");
      expect(w.find(".vc-menu-item__chevron--rotated").exists()).toBe(true);
    });

    it("toggles active class based on submenu open state", async () => {
      const w = factory({}, { submenu: submenuSlot });
      expect(w.find(".vc-menu-item").classes()).not.toContain("vc-menu-item--active");
      await w.find(".vc-menu-item__trigger").trigger("click");
      expect(w.find(".vc-menu-item").classes()).toContain("vc-menu-item--active");
    });
  });
});
