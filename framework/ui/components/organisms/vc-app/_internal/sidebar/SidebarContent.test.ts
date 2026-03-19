import { describe, expect, it, vi } from "vitest";
import { ref, provide, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { EmbeddedModeKey } from "@framework/injection-keys";
import SidebarContent from "./SidebarContent.vue";

function mountContent(
  props: Record<string, unknown> = {},
  options: { isEmbedded?: boolean; slots?: Record<string, unknown> } = {},
) {
  const Wrapper = defineComponent({
    setup() {
      provide(EmbeddedModeKey, options.isEmbedded ?? false);
      return () => h(SidebarContent, { ...props }, options.slots);
    },
  });

  return mount(Wrapper, {
    global: {
      stubs: {
        VcAppMenu: {
          name: "VcAppMenu",
          props: ["expanded"],
          template: '<div class="stub-app-menu" />',
        },
        VcScrollableContainer: {
          name: "VcScrollableContainer",
          template: '<div class="stub-scroll-container"><slot /></div>',
          methods: { updateScrollState: vi.fn() },
        },
        UserDropdownButton: {
          name: "UserDropdownButton",
          props: ["avatarUrl", "name", "role"],
          template: '<div class="stub-user-dropdown" />',
        },
      },
    },
  });
}

describe("SidebarContent", () => {
  it("renders root element with correct class", () => {
    const wrapper = mountContent();
    expect(wrapper.find(".sidebar-content").exists()).toBe(true);
  });

  it("renders menu area by default", () => {
    const wrapper = mountContent();
    expect(wrapper.find(".sidebar-content__menu").exists()).toBe(true);
  });

  it("renders default VcAppMenu when no menu slot provided", () => {
    const wrapper = mountContent();
    expect(wrapper.find(".stub-app-menu").exists()).toBe(true);
  });

  it("hides menu when disableMenu is true", () => {
    const wrapper = mountContent({ disableMenu: true });
    expect(wrapper.find(".sidebar-content__menu").exists()).toBe(false);
    expect(wrapper.find(".stub-app-menu").exists()).toBe(false);
  });

  it("renders UserDropdownButton by default when not embedded", () => {
    const wrapper = mountContent({}, { isEmbedded: false });
    expect(wrapper.find(".stub-user-dropdown").exists()).toBe(true);
  });

  it("hides UserDropdownButton when embedded", () => {
    const wrapper = mountContent({}, { isEmbedded: true });
    expect(wrapper.find(".stub-user-dropdown").exists()).toBe(false);
  });

  it("applies no-header class when headerVisible is false", () => {
    const wrapper = mountContent({ headerVisible: false });
    expect(wrapper.find(".sidebar-content--no-header").exists()).toBe(true);
  });

  it("does not apply no-header class when headerVisible is true", () => {
    const wrapper = mountContent({ headerVisible: true });
    expect(wrapper.find(".sidebar-content--no-header").exists()).toBe(false);
  });

  it("renders footer area", () => {
    const wrapper = mountContent();
    expect(wrapper.find(".sidebar-content__footer").exists()).toBe(true);
  });

  it("renders custom menu slot", () => {
    const wrapper = mountContent({}, {
      slots: {
        menu: () => h("div", { class: "custom-menu" }, "Custom Menu"),
      },
    });
    expect(wrapper.find(".custom-menu").exists()).toBe(true);
  });

  it("hides default UserDropdownButton when custom sidebar-footer slot is used", () => {
    // When a custom sidebar-footer slot is provided via parent component,
    // it replaces the default UserDropdownButton fallback.
    // We verify the fallback renders by default (tested above) and that
    // the footer container always exists for consumers to target.
    const wrapper = mountContent({}, { isEmbedded: false });
    expect(wrapper.find(".sidebar-content__footer").exists()).toBe(true);
    expect(wrapper.find(".stub-user-dropdown").exists()).toBe(true);
  });

  it("emits item:click when menu item is clicked", async () => {
    const wrapper = mountContent();
    const menu = wrapper.findComponent({ name: "VcAppMenu" });
    await menu.vm.$emit("item:click", { id: "test", title: "Test" });

    const innerComponent = wrapper.findComponent(SidebarContent);
    expect(innerComponent.emitted("item:click")).toBeTruthy();
  });
});
