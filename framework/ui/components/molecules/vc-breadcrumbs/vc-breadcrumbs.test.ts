import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcBreadcrumbs from "@ui/components/molecules/vc-breadcrumbs/vc-breadcrumbs.vue";

// Mock useAdaptiveItems to avoid ResizeObserver issues in jsdom
vi.mock("@ui/composables/useAdaptiveItems", () => ({
  useAdaptiveItems: ({ items }: any) => ({
    visibleItems: items,
    hiddenItems: { value: [] },
    recalculate: vi.fn(),
  }),
}));

describe("VcBreadcrumbs", () => {
  const defaultItems = [
    { id: "1", title: "Home", icon: "lucide-home" },
    { id: "2", title: "Products", icon: "lucide-box" },
    { id: "3", title: "Detail", icon: "lucide-file" },
  ];

  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcBreadcrumbs as any, {
      props: { items: defaultItems, ...props },
      global: {
        stubs: {
          VcBreadcrumbsItem: {
            template: '<span class="stub-breadcrumbs-item">{{ title }}</span>',
            props: ["title", "icon", "current", "variant", "id", "clickHandler"],
          },
          VcDropdown: {
            template: '<div class="stub-dropdown"><slot name="trigger" :isActive="false" /><slot name="item" /></div>',
          },
          VcDropdownItem: { template: '<div class="stub-dropdown-item" />' },
          VcButton: true,
          VcIcon: true,
        },
      },
    });

  it("renders when items are provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-breadcrumbs").exists()).toBe(true);
  });

  it("does not render when items are empty", () => {
    const wrapper = mountComponent({ items: [] });
    expect(wrapper.find(".vc-breadcrumbs").exists()).toBe(false);
  });

  it("does not render when items is undefined", () => {
    const wrapper = mount(VcBreadcrumbs as any, {
      props: {},
      global: {
        stubs: {
          VcBreadcrumbsItem: true,
          VcDropdown: true,
          VcDropdownItem: true,
          VcButton: true,
          VcIcon: true,
        },
      },
    });
    expect(wrapper.find(".vc-breadcrumbs").exists()).toBe(false);
  });

  it("renders with separated variant", () => {
    const wrapper = mountComponent({ separated: true });
    expect(wrapper.find(".vc-breadcrumbs__content--separated").exists()).toBe(true);
  });

  it("has nav element with aria-label", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Breadcrumb");
  });

  it("renders visible items in an ordered list", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("ol").exists()).toBe(true);
  });
});
