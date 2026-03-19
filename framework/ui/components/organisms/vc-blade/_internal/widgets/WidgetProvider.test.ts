import { describe, expect, it } from "vitest";
import { defineComponent, h, inject } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetIdKey } from "@framework/injection-keys";
import WidgetProvider from "./WidgetProvider.vue";

describe("WidgetProvider", () => {
  it("provides widgetId to child components", () => {
    let injectedId: string | undefined;

    const ChildComponent = defineComponent({
      setup() {
        injectedId = inject(WidgetIdKey);
        return () => h("div", "child");
      },
    });

    mount(WidgetProvider, {
      props: { widgetId: "test-widget-123" },
      slots: {
        default: () => h(ChildComponent),
      },
    });

    expect(injectedId).toBe("test-widget-123");
  });

  it("renders default slot content", () => {
    const wrapper = mount(WidgetProvider, {
      props: { widgetId: "w1" },
      slots: {
        default: '<div class="slot-content">Hello</div>',
      },
    });

    expect(wrapper.find(".slot-content").exists()).toBe(true);
    expect(wrapper.find(".slot-content").text()).toBe("Hello");
  });

  it("provides different ids for different instances", () => {
    const ids: string[] = [];

    const ChildComponent = defineComponent({
      setup() {
        const id = inject(WidgetIdKey);
        if (id) ids.push(id);
        return () => h("div");
      },
    });

    mount(WidgetProvider, {
      props: { widgetId: "widget-a" },
      slots: { default: () => h(ChildComponent) },
    });

    mount(WidgetProvider, {
      props: { widgetId: "widget-b" },
      slots: { default: () => h(ChildComponent) },
    });

    expect(ids).toEqual(["widget-a", "widget-b"]);
  });

  it("renders empty when no slot provided", () => {
    const wrapper = mount(WidgetProvider, {
      props: { widgetId: "w1" },
    });

    // WidgetProvider just renders <slot />, so empty without children
    expect(wrapper.text()).toBe("");
  });
});
