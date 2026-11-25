import { describe, expect, it, vi, beforeEach } from "vitest";
import { createApp } from "vue";

vi.mock("@core/notifications/notification", () => ({ notification: { error: vi.fn() } }));

import { notification } from "@core/notifications/notification";
import { setupGlobalErrorHandlers } from "./index";
import { BladeCloseCancelledError } from "@core/blade-navigation/closeCancelled";

function rejection(reason: unknown) {
  const event = new Event("unhandledrejection", { cancelable: true }) as Event & { reason: unknown };
  event.reason = reason;
  return event;
}

describe("setupGlobalErrorHandlers", () => {
  const app = createApp({});

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { __VC_GLOBAL_ERROR_HANDLERS_INSTALLED__?: boolean }).__VC_GLOBAL_ERROR_HANDLERS_INSTALLED__;
  });

  it("stays silent about a kept-open child blade, in a rejection or a Vue error", () => {
    setupGlobalErrorHandlers(app);
    const event = rejection(new BladeCloseCancelledError());
    window.dispatchEvent(event);
    app.config.errorHandler?.(new BladeCloseCancelledError(), null, "event handler");

    expect(event.defaultPrevented).toBe(true);
    expect(notification.error).not.toHaveBeenCalled();
  });

  it("still reports a real unhandled rejection", () => {
    setupGlobalErrorHandlers(app);
    window.dispatchEvent(rejection(new Error("request failed")));
    expect(notification.error).toHaveBeenCalledTimes(1);
  });
});
