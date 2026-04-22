import { describe, it, expect, vi } from "vitest";
import { computed, defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { NotificationContextKey } from "../types";
import { useNotificationContext } from "./useNotificationContext";
import { PushNotification } from "@core/api/platform";

describe("useNotificationContext", () => {
  it("returns the provided notification as ComputedRef", () => {
    const notification = { title: "Test", id: "1" } as PushNotification;

    const Child = defineComponent({
      setup() {
        const ctx = useNotificationContext();
        return () => h("div", ctx.value.title);
      },
    });

    const Parent = defineComponent({
      setup() {
        provide(
          NotificationContextKey,
          computed(() => notification),
        );
        return () => h(Child);
      },
    });

    const wrapper = mount(Parent);
    expect(wrapper.text()).toBe("Test");
  });

  it("throws when used outside a notification template", () => {
    const Child = defineComponent({
      setup() {
        expect(() => useNotificationContext()).toThrow(
          "useNotificationContext() must be used inside a notification template",
        );
        return () => h("div");
      },
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      mount(Child);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("supports generic typing for extended notification types", () => {
    interface CustomNotification extends PushNotification {
      productName?: string;
    }

    const notification = { title: "Product", productName: "Widget" } as unknown as PushNotification;
    (notification as any).productName = "Widget";

    const Child = defineComponent({
      setup() {
        const ctx = useNotificationContext<CustomNotification>();
        return () => h("div", ctx.value.productName ?? "");
      },
    });

    const Parent = defineComponent({
      setup() {
        provide(
          NotificationContextKey,
          computed(() => notification),
        );
        return () => h(Child);
      },
    });

    const wrapper = mount(Parent);
    expect(wrapper.text()).toBe("Widget");
  });
});
