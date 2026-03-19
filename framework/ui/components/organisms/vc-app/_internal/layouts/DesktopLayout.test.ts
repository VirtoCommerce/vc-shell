import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";

const sidebarState = {
  isPinned: ref(true),
  isExpanded: ref(true),
  isMenuOpen: ref(false),
  togglePin: vi.fn(),
  openMenu: vi.fn(),
  closeMenu: vi.fn(),
};

vi.mock("@core/composables/useSidebarState", () => ({
  useSidebarState: () => sidebarState,
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ fullPath: ref("/") }),
}));

import DesktopLayout from "./DesktopLayout.vue";

function mountLayout(props: Record<string, unknown> = {}) {
  return mount(DesktopLayout, {
    props: {
      logo: "/logo.png",
      ...props,
    },
    global: {
      stubs: {
        SidebarHeader: {
          name: "SidebarHeader",
          props: ["logo", "expanded", "showBurger", "isMenuOpen", "isNotificationsOpen"],
          template: '<div class="stub-sidebar-header" />',
        },
        SidebarContent: {
          name: "SidebarContent",
          props: ["expanded", "avatar", "userName", "userRole", "disableMenu", "headerVisible"],
          template: '<div class="stub-sidebar-content"><slot name="menu" /><slot name="sidebar-footer" /></div>',
        },
        SidebarCollapseButton: {
          name: "SidebarCollapseButton",
          props: ["collapsed"],
          template: '<div class="stub-collapse-button" @click="$emit(\'click\')" />',
        },
        AppHubPopover: {
          name: "AppHubPopover",
          props: ["show", "anchorRef", "appsList", "showApplications"],
          template: '<div class="stub-app-hub" />',
        },
        NotificationDropdown: {
          name: "NotificationDropdown",
          template: '<div class="stub-notifications" />',
        },
        VcDropdownPanel: {
          name: "VcDropdownPanel",
          props: ["show", "anchorRef", "placement", "width", "contentScrollable"],
          template: '<div class="stub-dropdown-panel"><slot /></div>',
        },
      },
    },
  });
}

describe("DesktopLayout", () => {
  beforeEach(() => {
    sidebarState.isPinned.value = true;
    sidebarState.isExpanded.value = true;
    sidebarState.isMenuOpen.value = false;
    vi.clearAllMocks();
  });

  it("renders desktop layout root", () => {
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout").exists()).toBe(true);
  });

  it("renders spacer element", () => {
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout__spacer").exists()).toBe(true);
  });

  it("applies expanded class to spacer when pinned", () => {
    sidebarState.isPinned.value = true;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout__spacer--expanded").exists()).toBe(true);
  });

  it("does not apply expanded class to spacer when not pinned", () => {
    sidebarState.isPinned.value = false;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout__spacer--expanded").exists()).toBe(false);
  });

  it("applies collapsed class when sidebar is not pinned", () => {
    sidebarState.isPinned.value = false;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout--collapsed").exists()).toBe(true);
  });

  it("does not apply collapsed class when sidebar is pinned", () => {
    sidebarState.isPinned.value = true;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout--collapsed").exists()).toBe(false);
  });

  it("renders SidebarHeader", () => {
    const wrapper = mountLayout();
    expect(wrapper.find(".stub-sidebar-header").exists()).toBe(true);
  });

  it("renders SidebarContent", () => {
    const wrapper = mountLayout();
    expect(wrapper.find(".stub-sidebar-content").exists()).toBe(true);
  });

  it("renders SidebarCollapseButton", () => {
    const wrapper = mountLayout();
    expect(wrapper.find(".stub-collapse-button").exists()).toBe(true);
  });

  it("renders wrap element with correct expansion classes", () => {
    sidebarState.isPinned.value = true;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout__wrap--expanded").exists()).toBe(true);
    expect(wrapper.find(".desktop-layout__wrap--collapsed").exists()).toBe(false);
  });

  it("renders wrap element with collapsed class when not pinned", () => {
    sidebarState.isPinned.value = false;
    const wrapper = mountLayout();
    expect(wrapper.find(".desktop-layout__wrap--collapsed").exists()).toBe(true);
    expect(wrapper.find(".desktop-layout__wrap--expanded").exists()).toBe(false);
  });
});
