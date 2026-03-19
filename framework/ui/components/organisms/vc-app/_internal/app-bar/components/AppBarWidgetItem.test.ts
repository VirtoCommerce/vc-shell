import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";

const mockCurrentWidget = ref<Record<string, unknown> | undefined>(undefined);
const mockToggleWidget = vi.fn();

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets", () => ({
  useAppBarWidgets: () => ({
    currentWidget: mockCurrentWidget,
    toggleWidget: mockToggleWidget,
  }),
}));

import AppBarWidgetItem from "./AppBarWidgetItem.vue";

function mountItem(props: Record<string, unknown> = {}, slots?: Record<string, unknown>) {
  return mount(AppBarWidgetItem, {
    props: {
      widgetId: "test-widget",
      ...props,
    },
    slots,
    global: {
      mocks: {
        $isMobile: ref(false),
      },
      stubs: {
        VcTooltip: {
          name: "VcTooltip",
          template: '<div class="vc-tooltip-stub"><slot /><slot name="tooltip" /></div>',
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

describe("AppBarWidgetItem", () => {
  beforeEach(() => {
    mockCurrentWidget.value = undefined;
    mockToggleWidget.mockClear();
  });

  it("renders root element with app-bar-button class", () => {
    const wrapper = mountItem();
    expect(wrapper.find(".app-bar-button").exists()).toBe(true);
  });

  it("renders default icon when no trigger slot provided", () => {
    const wrapper = mountItem({ icon: "lucide-bell" });
    expect(wrapper.find(".vc-icon-stub").exists()).toBe(true);
  });

  it("applies mobile class when $isMobile is true", () => {
    const wrapper = mount(AppBarWidgetItem, {
      props: { widgetId: "w1" },
      global: {
        mocks: { $isMobile: ref(true) },
        stubs: {
          VcTooltip: { template: '<div><slot /><slot name="tooltip" /></div>' },
          VcIcon: { template: '<i class="vc-icon-stub" />' },
        },
      },
    });
    expect(wrapper.find(".app-bar-button--mobile").exists()).toBe(true);
  });

  it("toggles widget on button click", async () => {
    const wrapper = mountItem({ widgetId: "my-widget" });
    await wrapper.find("button").trigger("click");

    expect(mockToggleWidget).toHaveBeenCalledWith("my-widget");
  });

  it("emits toggle event on button click", async () => {
    const wrapper = mountItem({ widgetId: "my-widget" });
    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("toggle")).toBeTruthy();
    expect(wrapper.emitted("toggle")![0]).toEqual([true]);
  });

  it("does not toggle when beforeOpen returns false", async () => {
    const beforeOpen = vi.fn(() => false);
    const wrapper = mountItem({ widgetId: "my-widget", beforeOpen });
    await wrapper.find("button").trigger("click");

    expect(beforeOpen).toHaveBeenCalled();
    expect(mockToggleWidget).not.toHaveBeenCalled();
  });

  it("computes isActive based on currentWidget id matching widgetId", () => {
    mockCurrentWidget.value = { id: "test-widget" };

    const wrapper = mountItem({ widgetId: "test-widget", icon: "lucide-bell" });
    expect(wrapper.find(".app-bar-button__icon--active").exists()).toBe(true);
  });

  it("icon is not active when widget ids do not match", () => {
    mockCurrentWidget.value = { id: "other-widget" };

    const wrapper = mountItem({ widgetId: "test-widget", icon: "lucide-bell" });
    expect(wrapper.find(".app-bar-button__icon--active").exists()).toBe(false);
  });

  it("renders trigger slot when provided", () => {
    const wrapper = mountItem(
      { widgetId: "w1" },
      {
        trigger: '<div class="custom-trigger">Custom</div>',
      },
    );
    expect(wrapper.find(".custom-trigger").exists()).toBe(true);
  });
});
