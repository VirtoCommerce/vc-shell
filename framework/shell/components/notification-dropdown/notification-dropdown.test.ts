import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createNotificationStore } from "@core/notifications";
import { NotificationStoreKey } from "@framework/injection-keys";
import { PushNotification } from "@core/api/platform";
import { createI18n } from "vue-i18n";

// Mock VcDropdown to avoid full component tree
vi.mock("@ui/components/molecules/vc-dropdown", () => ({
  VcDropdown: defineComponent({
    name: "VcDropdown",
    props: ["modelValue", "items", "emptyText", "maxHeight", "padded", "closeOnClickOutside"],
    setup(props, { slots }) {
      return () =>
        h(
          "div",
          { class: "vc-dropdown" },
          props.items?.map((item: any, idx: number) => slots.item?.({ item }) ?? h("div", { key: idx }, item.title)),
        );
    },
  }),
}));

// Mock internal notification component
vi.mock("@shell/components/notification-dropdown/_internal/notification/notification.vue", () => ({
  default: defineComponent({
    name: "NotificationItem",
    props: ["notification"],
    setup(props) {
      return () =>
        h("div", { class: "notification-item", "data-testid": props.notification?.id }, props.notification?.title);
    },
  }),
}));

// Mock lodash-es orderBy
vi.mock("lodash-es", () => ({
  orderBy: (arr: any[], keys: string[], dirs: string[]) => {
    return [...arr].sort((a, b) => {
      const aVal = a[keys[0]];
      const bVal = b[keys[0]];
      return dirs[0] === "desc" ? (bVal > aVal ? 1 : -1) : aVal > bVal ? 1 : -1;
    });
  },
}));

function makePush(overrides: Partial<PushNotification> = {}): PushNotification {
  return new PushNotification({
    id: "n-1",
    notifyType: "TestEvent",
    title: "Test Notification",
    isNew: true,
    created: new Date(),
    ...overrides,
  });
}

describe("notification-dropdown ↔ store integration", () => {
  it("renders notifications ingested into the store", async () => {
    const store = createNotificationStore();
    vi.spyOn(store, "markAllAsRead").mockResolvedValue(undefined as any);

    const i18n = createI18n({
      legacy: false,
      locale: "en",
      messages: { en: { COMPONENTS: { NOTIFICATION_DROPDOWN: { EMPTY: "No notifications" } } } },
    });

    const NotificationDropdown = (await import("./notification-dropdown.vue")).default;

    const wrapper = mount(NotificationDropdown, {
      global: {
        plugins: [i18n],
        provide: {
          [NotificationStoreKey as symbol]: store,
        },
      },
    });

    // Initially empty
    expect(wrapper.findAll(".notification-item")).toHaveLength(0);

    // Ingest a notification
    store.ingest(makePush({ id: "n-1", title: "First" }));
    await nextTick();

    expect(wrapper.findAll(".notification-item")).toHaveLength(1);
    expect(wrapper.find("[data-testid='n-1']").text()).toBe("First");

    // Ingest a second one
    store.ingest(makePush({ id: "n-2", title: "Second" }));
    await nextTick();

    expect(wrapper.findAll(".notification-item")).toHaveLength(2);

    wrapper.unmount();
  });

  it("calls markAllAsRead on unmount when there are unread notifications", async () => {
    const store = createNotificationStore();
    vi.spyOn(store, "markAllAsRead").mockResolvedValue(undefined as any);

    const i18n = createI18n({
      legacy: false,
      locale: "en",
      messages: { en: { COMPONENTS: { NOTIFICATION_DROPDOWN: { EMPTY: "No notifications" } } } },
    });

    const NotificationDropdown = (await import("./notification-dropdown.vue")).default;

    const wrapper = mount(NotificationDropdown, {
      global: {
        plugins: [i18n],
        provide: {
          [NotificationStoreKey as symbol]: store,
        },
      },
    });

    store.ingest(makePush({ id: "n-1", isNew: true }));
    await nextTick();

    wrapper.unmount();
    expect(store.markAllAsRead).toHaveBeenCalled();
  });
});
