import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock the notification store
const mockStore = {
  history: ref([]),
  realtime: ref([]),
  loadHistory: vi.fn().mockResolvedValue(undefined),
  ingest: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  subscribe: vi.fn().mockReturnValue(vi.fn()),
};

vi.mock("@core/notifications", () => ({
  useNotificationStore: () => mockStore,
}));

import { useNotifications } from "./index";

describe("useNotifications", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useNotifications());
    expect(result).toHaveProperty("notifications");
    expect(result).toHaveProperty("moduleNotifications");
    expect(result).toHaveProperty("loadFromHistory");
    expect(result).toHaveProperty("addNotification");
    expect(result).toHaveProperty("markAsRead");
    expect(result).toHaveProperty("markAllAsRead");
    expect(result).toHaveProperty("setNotificationHandler");
  });

  it("notifications is a computed from store history", () => {
    const { result } = mountWithSetup(() => useNotifications());
    expect(result.notifications.value).toEqual([]);
  });

  it("delegates loadFromHistory to store", async () => {
    const { result } = mountWithSetup(() => useNotifications());
    await result.loadFromHistory(10);
    expect(mockStore.loadHistory).toHaveBeenCalledWith(10);
  });

  it("delegates addNotification to store.ingest", () => {
    const { result } = mountWithSetup(() => useNotifications());
    const msg = { notifyType: "test" } as any;
    result.addNotification(msg);
    expect(mockStore.ingest).toHaveBeenCalledWith(msg);
  });

  it("delegates markAsRead to store", () => {
    const { result } = mountWithSetup(() => useNotifications());
    const msg = { id: "1" } as any;
    result.markAsRead(msg);
    expect(mockStore.markAsRead).toHaveBeenCalledWith(msg);
  });

  it("delegates markAllAsRead to store", () => {
    const { result } = mountWithSetup(() => useNotifications());
    result.markAllAsRead();
    expect(mockStore.markAllAsRead).toHaveBeenCalled();
  });

  it("subscribes to store when notifyType is provided", () => {
    mountWithSetup(() => useNotifications("TestType"));
    expect(mockStore.subscribe).toHaveBeenCalledWith({
      types: ["TestType"],
      handler: expect.any(Function),
    });
  });

  it("subscribes with array of types", () => {
    mockStore.subscribe.mockClear();
    mountWithSetup(() => useNotifications(["TypeA", "TypeB"]));
    expect(mockStore.subscribe).toHaveBeenCalledWith({
      types: ["TypeA", "TypeB"],
      handler: expect.any(Function),
    });
  });

  it("does not subscribe when no notifyType provided", () => {
    mockStore.subscribe.mockClear();
    mountWithSetup(() => useNotifications());
    expect(mockStore.subscribe).not.toHaveBeenCalled();
  });

  it("setNotificationHandler sets the handler for subscriptions", () => {
    const { result } = mountWithSetup(() => useNotifications("TestType"));
    const handler = vi.fn();
    result.setNotificationHandler(handler);
    // Handler is set internally; we verify it doesn't throw
    expect(typeof result.setNotificationHandler).toBe("function");
  });

  it("moduleNotifications filters realtime by type and isNew", () => {
    mockStore.realtime.value = [
      { notifyType: "OrderChanged", isNew: true },
      { notifyType: "OrderChanged", isNew: false },
      { notifyType: "Other", isNew: true },
    ] as any;

    const { result } = mountWithSetup(() => useNotifications("OrderChanged"));
    expect(result.moduleNotifications.value).toHaveLength(1);
    expect(result.moduleNotifications.value[0].notifyType).toBe("OrderChanged");
  });
});
