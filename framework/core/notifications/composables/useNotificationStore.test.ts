import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import type { PushNotification } from "@core/api/platform";

vi.mock("@core/api/platform", () => ({
  PushNotificationClient: class {
    markAllAsRead = vi.fn().mockResolvedValue(undefined);
    searchPushNotification = vi.fn().mockResolvedValue({ notifyEvents: [] });
  },
  PushNotificationSearchCriteria: class {
    take?: number;
    constructor(init?: Record<string, unknown>) {
      if (init) Object.assign(this, init);
    }
  },
}));

vi.mock("../toast-controller", () => ({
  createToastController: () => ({
    handle: vi.fn(),
  }),
}));

// Reset the module-level singleton between tests
beforeEach(async () => {
  vi.resetModules();
});

describe("useNotificationStore", () => {
  it("returns a NotificationStore object", async () => {
    const { useNotificationStore } = await import("./useNotificationStore");
    const { result } = mountWithSetup(() => useNotificationStore());
    expect(result).toBeDefined();
    expect(result.history).toBeDefined();
    expect(result.realtime).toBeDefined();
    expect(result.unreadCount).toBeDefined();
    expect(result.hasUnread).toBeDefined();
    expect(typeof result.registerType).toBe("function");
    expect(typeof result.ingest).toBe("function");
    expect(typeof result.markAsRead).toBe("function");
    expect(typeof result.markAllAsRead).toBe("function");
    expect(typeof result.subscribe).toBe("function");
    expect(typeof result.getByType).toBe("function");
  });

  it("returns the same singleton across multiple calls outside component", async () => {
    const { useNotificationStore } = await import("./useNotificationStore");
    const store1 = useNotificationStore();
    const store2 = useNotificationStore();
    expect(store1).toBe(store2);
  });

  it("creates singleton when no inject is available", async () => {
    const { useNotificationStore } = await import("./useNotificationStore");
    const store = useNotificationStore();
    expect(store).toBeDefined();
    expect(store.history.value).toEqual([]);
    expect(store.unreadCount.value).toBe(0);
  });

  it("prefers injected store inside component context", async () => {
    const { useNotificationStore } = await import("./useNotificationStore");
    const { NotificationStoreKey } = await import("@framework/injection-keys");
    const { createNotificationStore } = await import("../store");

    const injectedStore = createNotificationStore();

    let result: ReturnType<typeof useNotificationStore> | undefined;
    const Inner = defineComponent({
      setup() {
        result = useNotificationStore();
        return () => h("div");
      },
    });
    const Outer = defineComponent({
      setup() {
        provide(NotificationStoreKey, injectedStore);
        return () => h(Inner);
      },
    });
    mount(Outer);
    expect(result).toBe(injectedStore);
  });
});

describe("createNotificationStore", () => {
  it("starts with empty history and realtime", async () => {
    const { createNotificationStore } = await import("../store");
    const store = createNotificationStore();
    expect(store.history.value).toEqual([]);
    expect(store.realtime.value).toEqual([]);
    expect(store.unreadCount.value).toBe(0);
    expect(store.hasUnread.value).toBe(false);
  });

  describe("registerType", () => {
    it("registers a notification type config", async () => {
      const { createNotificationStore } = await import("../store");
      const store = createNotificationStore();
      const config = { toast: false as const };
      store.registerType("TestType", config);
      expect(store.registry.get("TestType")).toBe(config);
    });
  });

  describe("ingest", () => {
    it("adds a new notification to history and realtime", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      const msg = { id: "n1", isNew: true, notifyType: "Order" } as PushNotification;
      store.ingest(msg);
      expect(store.history.value).toHaveLength(1);
      expect(store.realtime.value).toHaveLength(1);
      expect(store.history.value[0].id).toBe("n1");
    });

    it("upserts existing notification preserving read state", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      store.markAsRead(store.history.value[0]);
      expect(store.history.value[0].isNew).toBe(false);
      // Re-ingest same id — should preserve isNew=false
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      expect(store.history.value).toHaveLength(1);
      expect(store.history.value[0].isNew).toBe(false);
    });

    it("excludes IndexProgressPushNotification type", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "idx1", isNew: true, notifyType: "IndexProgressPushNotification" } as PushNotification);
      expect(store.history.value).toHaveLength(0);
    });

    it("notifies subscribers matching type", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      const handler = vi.fn();
      store.subscribe({ types: ["Order"], handler });
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not notify subscribers for non-matching type", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      const handler = vi.fn();
      store.subscribe({ types: ["Order"], handler });
      store.ingest({ id: "n1", isNew: true, notifyType: "Payment" } as PushNotification);
      expect(handler).not.toHaveBeenCalled();
    });

    it("respects subscriber filter", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      const handler = vi.fn();
      store.subscribe({
        types: ["Order"],
        filter: (msg) => msg.id === "n2",
        handler,
      });
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      expect(handler).not.toHaveBeenCalled();
      store.ingest({ id: "n2", isNew: true, notifyType: "Order" } as PushNotification);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("markAsRead", () => {
    it("marks notification as read in history and realtime", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      expect(store.unreadCount.value).toBe(1);
      store.markAsRead(store.history.value[0]);
      expect(store.unreadCount.value).toBe(0);
      expect(store.hasUnread.value).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "n1", isNew: true, notifyType: "A" } as PushNotification);
      store.ingest({ id: "n2", isNew: true, notifyType: "B" } as PushNotification);
      expect(store.unreadCount.value).toBe(2);
      await store.markAllAsRead();
      expect(store.unreadCount.value).toBe(0);
    });
  });

  describe("subscribe / unsubscribe", () => {
    it("returns an unsubscribe function that stops notifications", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      const handler = vi.fn();
      const unsub = store.subscribe({ types: ["Order"], handler });
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
      store.ingest({ id: "n2", isNew: true, notifyType: "Order" } as PushNotification);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("getByType", () => {
    it("filters history by notifyType", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "n1", isNew: true, notifyType: "Order" } as PushNotification);
      store.ingest({ id: "n2", isNew: true, notifyType: "Payment" } as PushNotification);
      store.ingest({ id: "n3", isNew: true, notifyType: "Order" } as PushNotification);
      const orders = store.getByType("Order");
      expect(orders).toHaveLength(2);
      expect(orders.every((n) => n.notifyType === "Order")).toBe(true);
    });

    it("returns empty array for unknown type", async () => {
      const { createNotificationStore } = await import("../store");
      const store = createNotificationStore();
      expect(store.getByType("NonExistent")).toEqual([]);
    });
  });

  describe("unreadCount / hasUnread", () => {
    it("counts only isNew=true notifications", async () => {
      const { createNotificationStore } = await import("../store");

      const store = createNotificationStore();
      store.ingest({ id: "n1", isNew: true, notifyType: "A" } as PushNotification);
      store.ingest({ id: "n2", isNew: false, notifyType: "B" } as PushNotification);
      expect(store.unreadCount.value).toBe(1);
      expect(store.hasUnread.value).toBe(true);
    });
  });
});
