import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import UserDropdownButton from "./user-dropdown-button.vue";

// Mock composable
vi.mock("@core/composables/useSidebarState", () => ({
  useSidebarState: () => ({
    isPinned: ref(true),
    isExpanded: ref(true),
  }),
}));

// Stub child components
const stubs = {
  UserInfo: { name: "UserInfo", template: "<div class='user-info-stub' />" },
  SettingsMenu: { name: "SettingsMenu", template: "<div class='settings-menu-stub' />" },
  VcDropdownPanel: { name: "VcDropdownPanel", template: "<div class='dropdown-panel-stub'><slot /></div>", props: ["show", "anchorRef", "placement", "width", "maxWidth"] },
  UserSidebar: { name: "UserSidebar", template: "<div class='user-sidebar-stub' />" },
};

const globalConfig = {
  config: {
    globalProperties: {
      $isMobile: ref(false),
      $isDesktop: ref(true),
    },
  },
};

describe("UserDropdownButton", () => {
  it("renders the container", () => {
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-user-dropdown-button-container").exists()).toBe(true);
  });

  it("renders the button element", () => {
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find("button.vc-user-dropdown-button").exists()).toBe(true);
    expect(wrapper.find("button").attributes("type")).toBe("button");
  });

  it("toggles menu on button click", async () => {
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...globalConfig },
    });
    const button = wrapper.find("button.vc-user-dropdown-button");
    await button.trigger("click");
    expect(wrapper.find(".vc-user-dropdown-button--active").exists()).toBe(true);

    await button.trigger("click");
    expect(wrapper.find(".vc-user-dropdown-button--active").exists()).toBe(false);
  });

  it("renders VcDropdownPanel on desktop", () => {
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".dropdown-panel-stub").exists()).toBe(true);
    expect(wrapper.find(".user-sidebar-stub").exists()).toBe(false);
  });

  it("renders UserSidebar on mobile", () => {
    const mobileConfig = {
      config: {
        globalProperties: {
          $isMobile: ref(true),
          $isDesktop: ref(false),
        },
      },
    };
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...mobileConfig },
    });
    expect(wrapper.find(".user-sidebar-stub").exists()).toBe(true);
    expect(wrapper.find(".dropdown-panel-stub").exists()).toBe(false);
  });

  it("applies auto-width class when disabled", () => {
    const wrapper = mount(UserDropdownButton, {
      props: { disabled: true },
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-user-dropdown-button--auto-width").exists()).toBe(true);
  });

  it("does not apply auto-width class when not disabled", () => {
    const wrapper = mount(UserDropdownButton, {
      global: { stubs, ...globalConfig },
    });
    expect(wrapper.find(".vc-user-dropdown-button--auto-width").exists()).toBe(false);
  });
});
