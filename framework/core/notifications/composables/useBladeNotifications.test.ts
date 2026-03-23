import { describe, it, expect, beforeEach, vi } from "vitest";
import { effectScope } from "vue";
import { createNotificationStore, NotificationStore } from "../store";
import { PushNotification } from "@core/api/platform";

// Mock toast to avoid side effects
vi.mock("@core/notifications", () => {
  const notificationFn = vi.fn(() => "toast-id");
  notificationFn.success = vi.fn();
  notificationFn.error = vi.fn();
  notificationFn.warning = vi.fn();
  notificationFn.update = vi.fn();
  notificationFn.remove = vi.fn();
  return { notification: notificationFn };
});

let _testStore: NotificationStore;

// Mock useNotificationStore so the composable uses our test store
// (getCurrentInstance() is null outside component setup, so inject() won't work)
vi.mock("./useNotificationStore", () => ({
  useNotificationStore: () => _testStore,
}));

// Import after mocks are declared
const { useBladeNotifications } = await import("./useBladeNotifications");

function makePush(overrides: Partial<PushNotification> = {}): PushNotification {
  return new PushNotification({
    id: "test-1",
    notifyType: "TestEvent",
    title: "Test",
    isNew: true,
    created: new Date(),
    ...overrides,
  });
}

describe("useBladeNotifications", () => {
  let store: NotificationStore;

  beforeEach(() => {
    store = createNotificationStore();
    _testStore = store;
  });

  it("returns messages filtered by types", () => {
    store.ingest(makePush({ id: "1", notifyType: "A" }));
    store.ingest(makePush({ id: "2", notifyType: "B" }));

    const scope = effectScope();
    scope.run(() => {
      const { messages } = useBladeNotifications({ types: ["A"] });
      expect(messages.value).toHaveLength(1);
      expect(messages.value[0].notifyType).toBe("A");
    });
    scope.stop();
  });

  it("applies custom filter", () => {
    store.ingest(makePush({ id: "1", notifyType: "A", title: "Match" }));
    store.ingest(makePush({ id: "2", notifyType: "A", title: "NoMatch" }));

    const scope = effectScope();
    scope.run(() => {
      const { messages } = useBladeNotifications({
        types: ["A"],
        filter: (msg) => msg.title === "Match",
      });
      expect(messages.value).toHaveLength(1);
    });
    scope.stop();
  });

  it("calls onMessage when new notification arrives", () => {
    const onMessage = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useBladeNotifications({ types: ["TestEvent"], onMessage });
    });

    store.ingest(makePush());
    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ id: "test-1" }));
    scope.stop();
  });

  it("unsubscribes on scope dispose", () => {
    const onMessage = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useBladeNotifications({ types: ["TestEvent"], onMessage });
    });

    store.ingest(makePush({ id: "1" }));
    expect(onMessage).toHaveBeenCalledTimes(1);

    scope.stop();

    store.ingest(makePush({ id: "2" }));
    expect(onMessage).toHaveBeenCalledTimes(1); // no new call
  });

  it("returns unreadCount for matching types", () => {
    const scope = effectScope();
    scope.run(() => {
      const { unreadCount } = useBladeNotifications({ types: ["A"] });
      store.ingest(makePush({ id: "1", notifyType: "A" }));
      store.ingest(makePush({ id: "2", notifyType: "B" }));
      expect(unreadCount.value).toBe(1);
    });
    scope.stop();
  });

  it("markAsRead delegates to store", () => {
    store.ingest(makePush());

    const scope = effectScope();
    scope.run(() => {
      const { markAsRead, messages } = useBladeNotifications({ types: ["TestEvent"] });
      markAsRead(messages.value[0]);
      expect(store.history.value[0].isNew).toBe(false);
    });
    scope.stop();
  });
});
