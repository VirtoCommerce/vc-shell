import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// Mock the toolbar registration composable
vi.mock("@ui/components/organisms/vc-blade/_internal/composables/useToolbarRegistration", () => ({
  useToolbarRegistration: (items: any) => ({
    visibleItems: items,
  }),
}));

import BladeToolbar from "./BladeToolbar.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BladeToolbar, {
    props: { items: [], ...props },
    slots,
    global: {
      stubs: {
        ToolbarMobile: {
          name: "ToolbarMobile",
          props: ["items"],
          template: '<div class="toolbar-mobile-stub"></div>',
        },
        ToolbarDesktop: {
          name: "ToolbarDesktop",
          props: ["items", "isExpanded"],
          template: '<div class="toolbar-desktop-stub"></div>',
        },
      },
      mocks: {
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("BladeToolbar", () => {
  it("renders the toolbar container", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-blade-toolbar").exists()).toBe(true);
  });

  it("renders ToolbarDesktop on desktop", () => {
    const wrapper = factory();
    expect(wrapper.find(".toolbar-desktop-stub").exists()).toBe(true);
    expect(wrapper.find(".toolbar-mobile-stub").exists()).toBe(false);
  });

  it("renders ToolbarMobile on mobile", () => {
    const wrapper = mount(BladeToolbar, {
      props: { items: [] },
      global: {
        stubs: {
          ToolbarMobile: {
            name: "ToolbarMobile",
            props: ["items"],
            template: '<div class="toolbar-mobile-stub"></div>',
          },
          ToolbarDesktop: {
            name: "ToolbarDesktop",
            props: ["items", "isExpanded"],
            template: '<div class="toolbar-desktop-stub"></div>',
          },
        },
        mocks: {
          $isMobile: ref(true),
          $isDesktop: ref(false),
        },
      },
    });
    expect(wrapper.find(".toolbar-mobile-stub").exists()).toBe(true);
    expect(wrapper.find(".toolbar-desktop-stub").exists()).toBe(false);
  });

  it("applies mobile class when on mobile", () => {
    const wrapper = mount(BladeToolbar, {
      props: { items: [] },
      global: {
        stubs: {
          ToolbarMobile: { template: "<div />" },
          ToolbarDesktop: { template: "<div />" },
        },
        mocks: {
          $isMobile: ref(true),
          $isDesktop: ref(false),
        },
      },
    });
    expect(wrapper.find(".vc-blade-toolbar--mobile").exists()).toBe(true);
  });

  it("does not apply mobile class on desktop", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-blade-toolbar--mobile").exists()).toBe(false);
  });

  it("renders widgets-container slot when provided", () => {
    const wrapper = factory(
      {},
      { "widgets-container": '<div class="widget-container-test">Widgets</div>' },
    );
    expect(wrapper.find(".widget-container-test").exists()).toBe(true);
  });

  it("does not render widgets-container when slot is not provided", () => {
    const wrapper = factory();
    // No extra content beyond toolbar buttons
    expect(wrapper.find(".vc-blade-toolbar__content").exists()).toBe(true);
  });

  it("passes items prop through to child component", () => {
    const items = [{ id: "save", icon: "lucide-save", title: "Save" }];
    const wrapper = factory({ items });
    const desktop = wrapper.findComponent({ name: "ToolbarDesktop" });
    expect(desktop.exists()).toBe(true);
  });
});
