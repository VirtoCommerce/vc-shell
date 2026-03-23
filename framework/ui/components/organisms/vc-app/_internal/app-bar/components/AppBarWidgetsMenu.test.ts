import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";

const mockItems = ref<Record<string, unknown>[]>([]);

vi.mock("@core/composables", () => ({
  useAppBarWidget: () => ({
    items: mockItems,
  }),
}));

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets", () => ({
  useAppBarWidgets: () => ({
    currentWidget: ref(undefined),
    toggleWidget: vi.fn(),
  }),
}));

import AppBarWidgetsMenu from "./AppBarWidgetsMenu.vue";

function mountMenu() {
  return mount(AppBarWidgetsMenu, {
    global: {
      stubs: {
        AppBarWidgetItem: {
          name: "AppBarWidgetItem",
          props: ["widgetId"],
          template:
            '<div class="stub-widget-item" :data-widget-id="widgetId"><slot name="trigger" :isActive="false" /></div>',
        },
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size"],
          template: '<i class="vc-icon-stub" />',
        },
      },
    },
  });
}

describe("AppBarWidgetsMenu", () => {
  beforeEach(() => {
    mockItems.value = [];
  });

  it("renders root element with correct class", () => {
    const wrapper = mountMenu();
    expect(wrapper.find(".vc-app-toolbar-menu").exists()).toBe(true);
  });

  it("renders no items when items list is empty", () => {
    const wrapper = mountMenu();
    expect(wrapper.findAll(".vc-app-toolbar-menu__item")).toHaveLength(0);
  });

  it("renders widget items for items with component", () => {
    mockItems.value = [
      { id: "w1", component: { template: "<div />" }, icon: "lucide-bell" },
      { id: "w2", component: { template: "<div />" }, icon: "lucide-settings" },
    ];

    const wrapper = mountMenu();
    expect(wrapper.findAll(".vc-app-toolbar-menu__item")).toHaveLength(2);
  });

  it("renders items without component but with onClick", () => {
    mockItems.value = [{ id: "w1", onClick: vi.fn(), icon: "lucide-bell" }];

    const wrapper = mountMenu();
    expect(wrapper.findAll(".vc-app-toolbar-menu__item")).toHaveLength(1);
  });

  it("shows badge accent when badge is truthy boolean", () => {
    mockItems.value = [{ id: "w1", component: { template: "<div />" }, icon: "lucide-bell", badge: true }];

    const wrapper = mountMenu();
    expect(wrapper.find(".vc-app-toolbar-menu__accent").exists()).toBe(true);
  });

  it("hides badge accent when badge is false", () => {
    mockItems.value = [{ id: "w1", component: { template: "<div />" }, icon: "lucide-bell", badge: false }];

    const wrapper = mountMenu();
    expect(wrapper.find(".vc-app-toolbar-menu__accent").exists()).toBe(false);
  });

  it("evaluates badge function for active state", () => {
    mockItems.value = [{ id: "w1", component: { template: "<div />" }, icon: "lucide-bell", badge: () => true }];

    const wrapper = mountMenu();
    expect(wrapper.find(".vc-app-toolbar-menu__accent").exists()).toBe(true);
  });

  it("hides badge when badge is undefined", () => {
    mockItems.value = [{ id: "w1", component: { template: "<div />" }, icon: "lucide-bell" }];

    const wrapper = mountMenu();
    expect(wrapper.find(".vc-app-toolbar-menu__accent").exists()).toBe(false);
  });
});
