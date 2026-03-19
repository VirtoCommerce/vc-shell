import { describe, expect, it, vi, beforeEach } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mount } from "@vue/test-utils";

const mockCurrentWidget = ref<Record<string, unknown> | undefined>(undefined);
const mockIsAnyWidgetVisible = ref(false);
const mockHideAllWidgets = vi.fn();

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets", () => ({
  useAppBarWidgets: () => ({
    currentWidget: mockCurrentWidget,
    hideAllWidgets: mockHideAllWidgets,
    isAnyWidgetVisible: mockIsAnyWidgetVisible,
  }),
}));

import AppBarWidgetContent from "./AppBarWidgetContent.vue";

const StubWidget = defineComponent({
  name: "StubWidget",
  props: ["onClose"],
  emits: ["close"],
  setup(_, { emit }) {
    return () => h("div", { class: "stub-widget" }, "Widget Content");
  },
});

describe("AppBarWidgetContent", () => {
  beforeEach(() => {
    mockCurrentWidget.value = undefined;
    mockIsAnyWidgetVisible.value = false;
    mockHideAllWidgets.mockClear();
  });

  it("does not render when no widget is visible", () => {
    const wrapper = mount(AppBarWidgetContent);
    expect(wrapper.find(".app-bar-widget-content").exists()).toBe(false);
  });

  it("does not render when isAnyWidgetVisible is true but no component", () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = { id: "w1", component: undefined };

    const wrapper = mount(AppBarWidgetContent);
    expect(wrapper.find(".app-bar-widget-content").exists()).toBe(false);
  });

  it("renders widget component when visible and component exists", () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = { id: "w1", component: StubWidget, props: {} };

    const wrapper = mount(AppBarWidgetContent);
    expect(wrapper.find(".app-bar-widget-content").exists()).toBe(true);
    expect(wrapper.find(".stub-widget").exists()).toBe(true);
  });

  it("applies mobile class when mobile prop is true", () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = { id: "w1", component: StubWidget, props: {} };

    const wrapper = mount(AppBarWidgetContent, {
      props: { mobile: true },
    });
    expect(wrapper.find(".app-bar-widget-content--mobile").exists()).toBe(true);
  });

  it("does not apply mobile class by default", () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = { id: "w1", component: StubWidget, props: {} };

    const wrapper = mount(AppBarWidgetContent);
    expect(wrapper.find(".app-bar-widget-content--mobile").exists()).toBe(false);
  });

  it("calls hideAllWidgets on close event from widget component", async () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = { id: "w1", component: StubWidget, props: {} };

    const wrapper = mount(AppBarWidgetContent);
    await wrapper.findComponent(StubWidget).vm.$emit("close");

    expect(mockHideAllWidgets).toHaveBeenCalled();
  });

  it("passes widget props to the rendered component", () => {
    mockIsAnyWidgetVisible.value = true;
    mockCurrentWidget.value = {
      id: "w1",
      component: StubWidget,
      props: { customProp: "hello" },
    };

    const wrapper = mount(AppBarWidgetContent);
    const stubComponent = wrapper.findComponent(StubWidget);
    expect(stubComponent.props()).toHaveProperty("onClose");
  });
});
