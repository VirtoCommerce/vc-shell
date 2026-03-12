import { describe, it, expect, beforeEach, vi } from "vitest";
import { createNotificationStore } from "./store";
import { PushNotification } from "@core/api/platform";

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

describe("NotificationStore", () => {
  let store: ReturnType<typeof createNotificationStore>;

  beforeEach(() => {
    store = createNotificationStore();
  });

  describe("registerType", () => {
    it("registers a type config in the registry", () => {
      store.registerType("TestEvent", {
        severity: "info",
        toast: { mode: "auto" },
      });
      expect(store.registry.get("TestEvent")).toBeDefined();
      expect(store.registry.get("TestEvent")!.severity).toBe("info");
    });

    it("overwrites existing type config (idempotent)", () => {
      store.registerType("TestEvent", { severity: "info", toast: { mode: "auto" } });
      store.registerType("TestEvent", { severity: "error", toast: false });
      expect(store.registry.get("TestEvent")!.severity).toBe("error");
    });
  });

  describe("ingest", () => {
    it("adds message to history", () => {
      store.ingest(makePush());
      expect(store.history.value).toHaveLength(1);
      expect(store.history.value[0].id).toBe("test-1");
    });

    it("adds message to realtime", () => {
      store.ingest(makePush());
      expect(store.realtime.value).toHaveLength(1);
    });

    it("upserts existing message by id", () => {
      store.ingest(makePush({ title: "First" }));
      store.ingest(makePush({ title: "Updated" }));
      expect(store.history.value).toHaveLength(1);
      expect(store.history.value[0].title).toBe("Updated");
    });

    it("preserves isNew on upsert", () => {
      store.ingest(makePush({ isNew: true }));
      store.markAsRead(store.history.value[0]);
      store.ingest(makePush({ isNew: true }));
      expect(store.history.value[0].isNew).toBe(false);
    });

    it("skips excluded notification types", () => {
      store.ingest(makePush({ notifyType: "IndexProgressPushNotification" }));
      expect(store.history.value).toHaveLength(0);
    });

    it("calls matching subscriber handler", () => {
      const handler = vi.fn();
      store.subscribe({ types: ["TestEvent"], handler });
      store.ingest(makePush());
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: "test-1" }));
    });

    it("applies subscriber filter", () => {
      const handler = vi.fn();
      store.subscribe({
        types: ["TestEvent"],
        filter: (msg) => msg.title === "Match",
        handler,
      });
      store.ingest(makePush({ title: "NoMatch" }));
      expect(handler).not.toHaveBeenCalled();
      store.ingest(makePush({ id: "test-2", title: "Match" }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not call handler for non-matching types", () => {
      const handler = vi.fn();
      store.subscribe({ types: ["OtherEvent"], handler });
      store.ingest(makePush({ notifyType: "TestEvent" }));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("subscribe / unsubscribe", () => {
    it("returns unsubscribe function", () => {
      const handler = vi.fn();
      const unsub = store.subscribe({ types: ["TestEvent"], handler });
      store.ingest(makePush());
      expect(handler).toHaveBeenCalledTimes(1);

      unsub();
      store.ingest(makePush({ id: "test-2" }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("markAsRead", () => {
    it("sets isNew to false in history and realtime", () => {
      store.ingest(makePush());
      store.markAsRead(store.history.value[0]);
      expect(store.history.value[0].isNew).toBe(false);
      expect(store.realtime.value[0].isNew).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("sets all isNew to false", () => {
      store.ingest(makePush({ id: "1" }));
      store.ingest(makePush({ id: "2" }));
      store.markAllAsRead();
      expect(store.history.value.every((n) => !n.isNew)).toBe(true);
    });
  });

  describe("computed state", () => {
    it("unreadCount reflects isNew items in history", () => {
      store.ingest(makePush({ id: "1" }));
      store.ingest(makePush({ id: "2" }));
      expect(store.unreadCount.value).toBe(2);
      store.markAsRead(store.history.value[0]);
      expect(store.unreadCount.value).toBe(1);
    });

    it("hasUnread is true when unreadCount > 0", () => {
      expect(store.hasUnread.value).toBe(false);
      store.ingest(makePush());
      expect(store.hasUnread.value).toBe(true);
    });
  });

  describe("ingest with toast", () => {
    it("calls toastController.handle when type is registered", () => {
      const handleSpy = vi.fn();
      store = createNotificationStore({ toastHandle: handleSpy });
      store.registerType("TestEvent", { severity: "info", toast: { mode: "auto" } });
      store.ingest(makePush());
      expect(handleSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: "test-1" }),
        expect.objectContaining({ severity: "info" }),
        expect.any(Function), // markAsRead
      );
    });

    it("does not call toastController when type is not registered", () => {
      const handleSpy = vi.fn();
      store = createNotificationStore({ toastHandle: handleSpy });
      store.ingest(makePush());
      expect(handleSpy).not.toHaveBeenCalled();
    });
  });

  describe("getByType", () => {
    it("returns history items filtered by notifyType", () => {
      store.ingest(makePush({ id: "1", notifyType: "A" }));
      store.ingest(makePush({ id: "2", notifyType: "B" }));
      store.ingest(makePush({ id: "3", notifyType: "A" }));
      expect(store.getByType("A")).toHaveLength(2);
      expect(store.getByType("B")).toHaveLength(1);
    });
  });
});
