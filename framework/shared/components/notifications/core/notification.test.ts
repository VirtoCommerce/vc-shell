import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const appendInstance = vi.fn();
  const clear = vi.fn();
  const dismiss = vi.fn();
  const update = vi.fn();
  const getAllNotifications = vi.fn(() => [] as any[]);
  const getNotification = vi.fn();
  const hasNotification = vi.fn(() => false);
  let idCounter = 0;
  return {
    appendInstance,
    clear,
    dismiss,
    update,
    getAllNotifications,
    getNotification,
    hasNotification,
    resetCounter: () => { idCounter = 0; },
    nextId: () => `id-${++idCounter}`,
  };
});

vi.mock("@shared/components/notifications/composables/useContainer", () => ({
  useContainer: () => ({
    defaultOptions: { timeout: 3000, pauseOnHover: true, position: "top-center" },
    actions: {
      add: vi.fn(),
      remove: vi.fn(),
      clear: mocks.clear,
      dismiss: mocks.dismiss,
      update: mocks.update,
    },
    appendInstance: mocks.appendInstance,
    generateNotificationId: () => mocks.nextId(),
    getAllNotifications: mocks.getAllNotifications,
    getNotification: mocks.getNotification,
    hasNotification: mocks.hasNotification,
  }),
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { notification } from "./notification";

describe("notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resetCounter();
  });

  it("notification() calls appendInstance with type 'default'", () => {
    notification("Hello");
    expect(mocks.appendInstance).toHaveBeenCalledTimes(1);
    const opts = mocks.appendInstance.mock.calls[0][0];
    expect(opts.type).toBe("default");
    expect(opts.content).toBe("Hello");
  });

  it("notification.error() sets type to 'error'", () => {
    notification.error("Error msg");
    const opts = mocks.appendInstance.mock.calls[0][0];
    expect(opts.type).toBe("error");
    expect(opts.content).toBe("Error msg");
  });

  it("notification.warning() sets type to 'warning'", () => {
    notification.warning("Warn msg");
    const opts = mocks.appendInstance.mock.calls[0][0];
    expect(opts.type).toBe("warning");
  });

  it("notification.success() sets type to 'success'", () => {
    notification.success("OK msg");
    const opts = mocks.appendInstance.mock.calls[0][0];
    expect(opts.type).toBe("success");
  });

  it("returns a notification ID", () => {
    const id = notification("Test");
    expect(id).toBe("id-1");
  });

  it("uses provided notificationId if given", () => {
    const id = notification("Test", { notificationId: "custom-id" });
    expect(id).toBe("custom-id");
  });

  it("clearAll calls actions.clear", () => {
    notification.clearAll();
    expect(mocks.clear).toHaveBeenCalledTimes(1);
  });

  it("remove(id) calls actions.dismiss", () => {
    notification.remove("abc");
    expect(mocks.dismiss).toHaveBeenCalledWith("abc");
  });

  it("remove() without id calls actions.clear", () => {
    notification.remove();
    expect(mocks.clear).toHaveBeenCalledTimes(1);
  });

  it("update() returns id when notification not found", () => {
    mocks.hasNotification.mockReturnValue(false);
    const result = notification.update("missing-id", { type: "success" });
    expect(result).toBe("missing-id");
  });

  it("update() calls actions.update when notification found (same position)", () => {
    mocks.hasNotification.mockReturnValue(true);
    mocks.getNotification.mockReturnValue({
      notificationId: "x",
      position: "top-center",
      content: "Old",
    });
    const result = notification.update("x", { content: "New" });
    expect(mocks.update).toHaveBeenCalled();
    expect(result).toBe("x");
  });

  it("clearPosition dismisses only notifications in that position", () => {
    mocks.getAllNotifications.mockReturnValue([
      { notificationId: "a", position: "top-right" },
      { notificationId: "b", position: "top-center" },
      { notificationId: "c", position: "top-right" },
    ]);
    notification.clearPosition("top-right");
    expect(mocks.dismiss).toHaveBeenCalledTimes(2);
    expect(mocks.dismiss).toHaveBeenCalledWith("a");
    expect(mocks.dismiss).toHaveBeenCalledWith("c");
  });
});
