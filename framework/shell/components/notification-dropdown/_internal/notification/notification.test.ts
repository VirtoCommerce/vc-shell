import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import Notification from "./notification.vue";

// Mock dependencies
vi.mock("@core/notifications", () => ({
  useNotificationStore: vi.fn(() => ({
    registry: new Map(),
  })),
}));

vi.mock("@shell/components/notification-template", () => ({
  NotificationTemplate: defineComponent({
    name: "NotificationTemplate",
    props: ["title", "notification"],
    setup(_, { slots }) {
      return () => h("div", { class: "mock-notification-template" }, slots.default?.());
    },
  }),
}));

import { useNotificationStore } from "@core/notifications";

const VcHintStub = defineComponent({
  name: "VcHint",
  setup(_, { slots }) {
    return () => h("div", { class: "mock-vc-hint" }, slots.default?.());
  },
});

function makeNotification(overrides = {}) {
  return {
    title: "Test Title",
    description: "Test description",
    isNew: false,
    notifyType: undefined,
    ...overrides,
  };
}

function mountNotification(notification: any) {
  return mount(Notification, {
    props: { notification },
    global: {
      stubs: { VcHint: VcHintStub },
    },
  });
}

describe("notification.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default template when no custom template registered", () => {
    const wrapper = mountNotification(makeNotification());
    expect(wrapper.find(".vc-notification-item").exists()).toBe(true);
    expect(wrapper.find(".mock-notification-template").exists()).toBe(true);
  });

  it("shows unread dot when notification.isNew is true", () => {
    const wrapper = mountNotification(makeNotification({ isNew: true }));
    const dot = wrapper.find(".vc-notification-item__unread-dot");
    expect(dot.attributes("style")).toContain("visible");
  });

  it("hides unread dot when notification.isNew is false", () => {
    const wrapper = mountNotification(makeNotification({ isNew: false }));
    const dot = wrapper.find(".vc-notification-item__unread-dot");
    expect(dot.attributes("style")).toContain("hidden");
  });

  it("renders description via VcHint when description exists", () => {
    const wrapper = mountNotification(makeNotification({ description: "Some desc" }));
    expect(wrapper.find(".mock-vc-hint").exists()).toBe(true);
    expect(wrapper.text()).toContain("Some desc");
  });

  it("does not render VcHint when description is empty", () => {
    const wrapper = mountNotification(makeNotification({ description: undefined }));
    expect(wrapper.find(".mock-vc-hint").exists()).toBe(false);
  });

  it("emits onClick with the notification when clicked", async () => {
    const notif = makeNotification();
    const wrapper = mountNotification(notif);
    await wrapper.find(".vc-notification-item").trigger("click");
    expect(wrapper.emitted("onClick")).toBeTruthy();
    expect(wrapper.emitted("onClick")![0][0]).toEqual(notif);
  });

  it("uses custom template when notifyType is registered", () => {
    const CustomTemplate = defineComponent({
      name: "CustomTemplate",
      props: ["notification"],
      setup() {
        return () => h("div", { class: "custom-template" }, "Custom");
      },
    });

    const registry = new Map();
    registry.set("order-update", { template: CustomTemplate });
    vi.mocked(useNotificationStore).mockReturnValue({ registry } as any);

    const wrapper = mountNotification(makeNotification({ notifyType: "order-update" }));
    expect(wrapper.find(".custom-template").exists()).toBe(true);
    expect(wrapper.find(".mock-notification-template").exists()).toBe(false);
  });
});
