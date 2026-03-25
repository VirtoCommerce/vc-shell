import { describe, expect, it, vi } from "vitest";
import { ref, provide, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { EmbeddedModeKey, IsDesktopKey, IsMobileKey } from "@framework/injection-keys";
import MenuSidebar from "./MenuSidebar.vue";

function mountSidebar(
  props: Record<string, unknown> = {},
  options: { isMobile?: boolean; isDesktop?: boolean; isEmbedded?: boolean } = {},
) {
  const Wrapper = defineComponent({
    setup() {
      provide(IsMobileKey, ref(options.isMobile ?? false));
      provide(IsDesktopKey, ref(options.isDesktop ?? true));
      provide(EmbeddedModeKey, options.isEmbedded ?? false);
      return () =>
        h(MenuSidebar, {
          isOpened: true,
          expanded: false,
          "onUpdate:isOpened": vi.fn(),
          ...props,
        });
    },
  });

  return mount(Wrapper, {
    global: {
      stubs: {
        VcButton: {
          name: "VcButton",
          template: '<button class="vc-button-stub" @click="$emit(\'click\')"><slot /></button>',
        },
        VcSidebar: {
          name: "VcSidebar",
          props: ["modelValue", "position", "closeButton"],
          template: '<div class="vc-sidebar-stub"><slot /></div>',
        },
      },
    },
  });
}

describe("MenuSidebar", () => {
  it("renders wrapper element", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find(".menu-sidebar__wrapper").exists()).toBe(true);
  });

  it("shows header on desktop when not embedded", () => {
    const wrapper = mountSidebar({}, { isDesktop: true, isEmbedded: false });
    expect(wrapper.find(".menu-sidebar__header").exists()).toBe(true);
  });

  it("hides header when embedded", () => {
    const wrapper = mountSidebar({}, { isDesktop: true, isEmbedded: true });
    // Embedded + desktop with no widget slots = header hidden
    expect(wrapper.find(".menu-sidebar__header").exists()).toBe(false);
  });

  it("shows close button on desktop", () => {
    const wrapper = mountSidebar({}, { isDesktop: true });
    expect(wrapper.find(".menu-sidebar__close-button").exists()).toBe(true);
  });

  it("applies desktop expanded class", () => {
    const wrapper = mountSidebar({ expanded: true }, { isDesktop: true });
    expect(wrapper.find(".menu-sidebar__wrapper--expanded").exists()).toBe(true);
  });

  it("applies desktop class on wrapper", () => {
    const wrapper = mountSidebar({}, { isDesktop: true });
    expect(wrapper.find(".menu-sidebar__wrapper--desktop").exists()).toBe(true);
  });

  it("renders app-hub slot on desktop", () => {
    const Wrapper = defineComponent({
      setup() {
        provide(IsMobileKey, ref(false));
        provide(IsDesktopKey, ref(true));
        provide(EmbeddedModeKey, false);
        return () =>
          h(
            MenuSidebar,
            { isOpened: true, expanded: false },
            { "app-hub": () => h("div", { class: "custom-app-hub" }) },
          );
      },
    });

    const wrapper = mount(Wrapper, {
      global: {
        stubs: {
          VcButton: { template: "<button />" },
          VcSidebar: { template: "<div><slot /></div>" },
        },
      },
    });

    expect(wrapper.find(".custom-app-hub").exists()).toBe(true);
  });

  it("renders navmenu and user-dropdown slots on mobile", () => {
    const Wrapper = defineComponent({
      setup() {
        provide(IsMobileKey, ref(true));
        provide(IsDesktopKey, ref(false));
        provide(EmbeddedModeKey, false);
        return () =>
          h(
            MenuSidebar,
            { isOpened: true, expanded: false },
            {
              navmenu: () => h("div", { class: "custom-navmenu" }),
              "user-dropdown": () => h("div", { class: "custom-user-dropdown" }),
            },
          );
      },
    });

    const wrapper = mount(Wrapper, {
      global: {
        stubs: {
          VcButton: { template: "<button />" },
          VcSidebar: { template: "<div><slot /></div>" },
        },
      },
    });

    expect(wrapper.find(".custom-navmenu").exists()).toBe(true);
    expect(wrapper.find(".custom-user-dropdown").exists()).toBe(true);
  });

  it("uses VcSidebar wrapper on mobile", () => {
    const Wrapper = defineComponent({
      setup() {
        provide(IsMobileKey, ref(true));
        provide(IsDesktopKey, ref(false));
        provide(EmbeddedModeKey, false);
        return () => h(MenuSidebar, { isOpened: true, expanded: false });
      },
    });

    const wrapper = mount(Wrapper, {
      global: {
        stubs: {
          VcButton: { template: "<button />" },
          VcSidebar: {
            template: '<div class="vc-sidebar-stub"><slot /></div>',
            props: ["modelValue", "position", "closeButton"],
          },
        },
      },
    });

    expect(wrapper.find(".vc-sidebar-stub").exists()).toBe(true);
  });
});
