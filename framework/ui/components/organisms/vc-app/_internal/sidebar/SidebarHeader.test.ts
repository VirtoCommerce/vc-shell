import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref, provide, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { ShellIndicatorsKey } from "@framework/injection-keys";
import SidebarHeader from "./SidebarHeader.vue";

function mountHeader(props: Record<string, unknown> = {}, options: { hasUnread?: boolean } = {}) {
  const Wrapper = defineComponent({
    setup() {
      provide(ShellIndicatorsKey, ref(options.hasUnread ?? false));
      return () => h(SidebarHeader, { ...props });
    },
  });

  return mount(Wrapper, {
    global: {
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size"],
          template: '<i class="vc-icon-stub" :data-icon="icon" />',
        },
      },
    },
  });
}

describe("SidebarHeader", () => {
  it("renders when isVisible is true (default)", () => {
    const wrapper = mountHeader({ logo: "/logo.png" });
    expect(wrapper.find(".sidebar-header").exists()).toBe(true);
  });

  it("does not render when isVisible is false", () => {
    const wrapper = mountHeader({ isVisible: false });
    expect(wrapper.find(".sidebar-header").exists()).toBe(false);
  });

  it("renders logo image with correct src", () => {
    const wrapper = mountHeader({ logo: "/test-logo.png" });
    const img = wrapper.find(".sidebar-header__logo-image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/test-logo.png");
  });

  it("emits logo:click when logo image is clicked", async () => {
    const wrapper = mountHeader({ logo: "/logo.png" });
    await wrapper.find(".sidebar-header__logo-image").trigger("click");

    const innerComponent = wrapper.findComponent(SidebarHeader);
    expect(innerComponent.emitted("logo:click")).toBeTruthy();
  });

  it("applies collapsed class when expanded is false", () => {
    const wrapper = mountHeader({ expanded: false });
    expect(wrapper.find(".sidebar-header--collapsed").exists()).toBe(true);
  });

  it("does not apply collapsed class when expanded is true", () => {
    const wrapper = mountHeader({ expanded: true });
    expect(wrapper.find(".sidebar-header--collapsed").exists()).toBe(false);
  });

  it("applies mobile class when isMobile is true", () => {
    const wrapper = mountHeader({ isMobile: true });
    expect(wrapper.find(".sidebar-header--mobile").exists()).toBe(true);
  });

  it("shows toolbar with notification bell when expanded and not mobile", () => {
    const wrapper = mountHeader({ expanded: true, isMobile: false });
    expect(wrapper.find(".sidebar-header__toolbar").exists()).toBe(true);
    expect(wrapper.find(".sidebar-header__notification-bell").exists()).toBe(true);
  });

  it("hides toolbar when collapsed", () => {
    const wrapper = mountHeader({ expanded: false });
    expect(wrapper.find(".sidebar-header__toolbar").exists()).toBe(false);
  });

  it("shows burger button when showBurger is true and expanded", () => {
    const wrapper = mountHeader({ expanded: true, showBurger: true });
    expect(wrapper.find(".sidebar-header__menu-button").exists()).toBe(true);
  });

  it("hides burger when showBurger is false", () => {
    const wrapper = mountHeader({ expanded: true, showBurger: false });
    expect(wrapper.find(".sidebar-header__menu-button").exists()).toBe(false);
  });

  it("emits toggle-menu on burger click", async () => {
    const wrapper = mountHeader({ expanded: true, showBurger: true });
    await wrapper.find(".sidebar-header__menu-button").trigger("click");

    const innerComponent = wrapper.findComponent(SidebarHeader);
    expect(innerComponent.emitted("toggle-menu")).toBeTruthy();
  });

  it("emits toggle-notifications on notification bell click", async () => {
    const wrapper = mountHeader({ expanded: true });
    await wrapper.find(".sidebar-header__notification-bell").trigger("click");

    const innerComponent = wrapper.findComponent(SidebarHeader);
    expect(innerComponent.emitted("toggle-notifications")).toBeTruthy();
  });

  it("shows X icon when isNotificationsOpen is true", () => {
    const wrapper = mountHeader({ expanded: true, isNotificationsOpen: true });
    const icons = wrapper.findAll(".vc-icon-stub");
    const closeIcon = icons.find((i) => i.attributes("data-icon") === "lucide-x");
    expect(closeIcon).toBeTruthy();
  });

  it("shows bell icon when isNotificationsOpen is false", () => {
    const wrapper = mountHeader({ expanded: true, isNotificationsOpen: false });
    const icons = wrapper.findAll(".vc-icon-stub");
    const bellIcon = icons.find((i) => i.attributes("data-icon") === "lucide-bell");
    expect(bellIcon).toBeTruthy();
  });

  it("shows unread accent dot on logo when collapsed and hasUnread", () => {
    const wrapper = mountHeader({ expanded: false }, { hasUnread: true });
    expect(wrapper.find(".sidebar-header__accent--logo").exists()).toBe(true);
  });

  it("hides unread accent dot when no unread", () => {
    const wrapper = mountHeader({ expanded: false }, { hasUnread: false });
    expect(wrapper.find(".sidebar-header__accent--logo").exists()).toBe(false);
  });

  it("shows mobile title when isMobile and showMobileTitle are true", () => {
    const wrapper = mountHeader({ isMobile: true, showMobileTitle: true, mobileTitle: "Dashboard" });
    expect(wrapper.find(".sidebar-header__blade-title").exists()).toBe(true);
    expect(wrapper.find(".sidebar-header__blade-title").text()).toBe("Dashboard");
  });

  it("renders actions slot on mobile", () => {
    const Wrapper = defineComponent({
      setup() {
        provide(ShellIndicatorsKey, ref(false));
        return () =>
          h(
            SidebarHeader,
            { isMobile: true },
            {
              actions: () => h("div", { class: "custom-actions" }),
            },
          );
      },
    });

    const wrapper = mount(Wrapper, {
      global: {
        stubs: {
          VcIcon: { template: '<i class="vc-icon-stub" />' },
        },
      },
    });

    expect(wrapper.find(".custom-actions").exists()).toBe(true);
  });
});
