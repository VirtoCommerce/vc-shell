import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAsync } from "./index";
import { DisplayableError } from "@core/utilities/error";
import { cancelPendingErrorNotification } from "@core/utilities/pendingErrorNotifications";

vi.mock("@shared/components/notifications/core/notification", () => ({
  notification: { error: vi.fn(), remove: vi.fn() },
}));

import { notification } from "@shared/components/notifications/core/notification";

describe("useAsync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return error ref alongside loading and action", () => {
    const { loading, action, error } = useAsync(async () => {});
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(typeof action).toBe("function");
  });

  it("should set error ref on failure", async () => {
    const { action, error } = useAsync(async () => {
      throw new Error("test");
    });
    await expect(action()).rejects.toThrow("test");
    expect(error.value).toBeInstanceOf(DisplayableError);
    expect(error.value!.message).toBe("test");
  });

  it("should clear error on next successful invocation", async () => {
    let shouldFail = true;
    const { action, error } = useAsync(async () => {
      if (shouldFail) throw new Error("fail");
    });

    await expect(action()).rejects.toThrow();
    expect(error.value).not.toBeNull();

    shouldFail = false;
    await action();
    expect(error.value).toBeNull();
  });

  it("should schedule deferred notification by default", async () => {
    const { action } = useAsync(async () => {
      throw new Error("notify me");
    });
    await expect(action()).rejects.toThrow();

    // Before timer fires, notification not yet shown
    expect(notification.error).not.toHaveBeenCalled();

    // After timer fires (+ microtask flush for dynamic import), notification appears
    await vi.runAllTimersAsync();
    expect(notification.error).toHaveBeenCalledWith(
      "notify me",
      expect.objectContaining({ notificationId: expect.any(String) }),
    );
  });

  it("should allow ErrorInterceptor to cancel deferred notification", async () => {
    const { action } = useAsync(async () => {
      throw new Error("cancellable");
    });

    let caughtError: unknown;
    try {
      await action();
    } catch (e) {
      caughtError = e;
    }

    // Simulate what ErrorInterceptor does — cancel before timer fires
    const cancelled = cancelPendingErrorNotification(caughtError);
    expect(cancelled).toBe(true);

    await vi.runAllTimersAsync();
    expect(notification.error).not.toHaveBeenCalled();
  });

  it("should suppress notification when notify: false", async () => {
    const { action } = useAsync(
      async () => {
        throw new Error("silent");
      },
      { notify: false },
    );
    await expect(action()).rejects.toThrow();
    await vi.runAllTimersAsync();
    expect(notification.error).not.toHaveBeenCalled();
  });

  it("should still re-throw (backward compat)", async () => {
    const { action } = useAsync(async () => {
      throw new Error("rethrow");
    });
    await expect(action()).rejects.toThrow("rethrow");
  });

  it("backward compat: destructuring without error works", async () => {
    const { loading, action } = useAsync(async () => "result");
    const result = await action();
    expect(result).toBe("result");
    expect(loading.value).toBe(false);
  });
});
