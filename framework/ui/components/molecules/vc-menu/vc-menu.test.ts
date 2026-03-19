import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcMenu from "@ui/components/molecules/vc-menu/vc-menu.vue";

describe("VcMenu", () => {
  const mountComponent = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(VcMenu as any, {
      props,
      slots,
      global: {
        stubs: {
          VcSkeleton: {
            template: '<div class="stub-skeleton" />',
            props: ["variant", "width", "height"],
          },
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent({}, { default: "<div>Menu content</div>" });
    expect(wrapper.find(".vc-menu").exists()).toBe(true);
  });

  it("renders default slot content when not loading", () => {
    const wrapper = mountComponent({}, { default: '<div class="menu-item">Item</div>' });
    expect(wrapper.find(".vc-menu__items").exists()).toBe(true);
    expect(wrapper.find(".menu-item").exists()).toBe(true);
  });

  it("renders skeleton when loading", () => {
    const wrapper = mountComponent({ loading: true });
    expect(wrapper.find(".vc-menu__skeleton").exists()).toBe(true);
  });

  it("does not render menu items when loading", () => {
    const wrapper = mountComponent({ loading: true }, { default: "<div>Item</div>" });
    expect(wrapper.find(".vc-menu__items").exists()).toBe(false);
  });

  it("does not render skeleton when not loading", () => {
    const wrapper = mountComponent({ loading: false }, { default: "<div>Content</div>" });
    expect(wrapper.find(".vc-menu__skeleton").exists()).toBe(false);
  });

  it("renders skeleton sections with correct structure", () => {
    const wrapper = mountComponent({ loading: true });
    const sections = wrapper.findAll(".vc-menu__skeleton-section");
    expect(sections.length).toBe(2);
  });

  it("does not render items div when no default slot", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-menu__items").exists()).toBe(false);
  });
});
