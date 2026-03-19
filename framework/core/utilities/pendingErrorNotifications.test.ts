import { describe, expect, it, vi, beforeEach } from "vitest";
import { setPendingErrorNotification, cancelPendingErrorNotification } from "./pendingErrorNotifications";

vi.mock("@core/notifications/notification", () => ({
  notification: { remove: vi.fn() },
}));

describe("pendingErrorNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("cancel returns true for registered error", () => {
    const error = { message: "test" };
    const timerId = setTimeout(() => {}, 1000);
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    setPendingErrorNotification(error, timerId, "n1");
    expect(cancelPendingErrorNotification(error)).toBe(true);
    expect(clearSpy).toHaveBeenCalledWith(timerId);
  });

  it("returns false for unknown error", () => {
    expect(cancelPendingErrorNotification({ message: "unknown" })).toBe(false);
  });

  it("returns false for null", () => {
    expect(cancelPendingErrorNotification(null)).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(cancelPendingErrorNotification("str")).toBe(false);
    expect(cancelPendingErrorNotification(42)).toBe(false);
  });

  it("cancels via originalError fallback", () => {
    const original = { message: "orig" };
    const timerId = setTimeout(() => {}, 1000);
    setPendingErrorNotification(original, timerId, "n2");
    const wrapper = { message: "wrapped", originalError: original };
    expect(cancelPendingErrorNotification(wrapper)).toBe(true);
  });

  it("does not cancel same error twice", () => {
    const error = { message: "once" };
    setPendingErrorNotification(error, setTimeout(() => {}, 1000), "n3");
    cancelPendingErrorNotification(error);
    expect(cancelPendingErrorNotification(error)).toBe(false);
  });
});
