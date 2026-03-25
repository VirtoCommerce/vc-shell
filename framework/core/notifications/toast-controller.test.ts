import { describe, it, expect, beforeEach, vi } from "vitest";
import { createToastController, type IToastController } from "./toast-controller";
import { PushNotification } from "@core/api/platform";
import { NotificationTypeConfig } from "./types";

// Mock the notification imperative API
vi.mock("@core/notifications/notification", () => {
  const notificationFn = vi.fn(() => "toast-id-1");
  notificationFn.success = vi.fn(() => "toast-id-s");
  notificationFn.error = vi.fn(() => "toast-id-e");
  notificationFn.warning = vi.fn(() => "toast-id-w");
  notificationFn.update = vi.fn();
  notificationFn.remove = vi.fn();
  return { notification: notificationFn };
});

import { notification } from "@core/notifications/notification";

function makePush(overrides: Partial<PushNotification> = {}): PushNotification {
  return {
    id: "msg-1",
    notifyType: "TestEvent",
    title: "Test title",
    isNew: true,
    created: new Date(),
    ...overrides,
  } as PushNotification;
}

describe("ToastController", () => {
  let controller: IToastController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = createToastController();
  });

  describe("auto mode", () => {
    const config: NotificationTypeConfig = {
      toast: { mode: "auto", severity: "info" },
    };

    it("shows a toast with severity-based timeout", () => {
      controller.handle(makePush(), config);
      expect(notification).toHaveBeenCalledWith("Test title", expect.objectContaining({ timeout: 5000 }));
    });

    it("uses warning timeout for warning severity", () => {
      const warnConfig: NotificationTypeConfig = {
        toast: { mode: "auto", severity: "warning" },
      };
      controller.handle(makePush(), warnConfig);
      expect(notification).toHaveBeenCalledWith("Test title", expect.objectContaining({ timeout: 8000 }));
    });

    it("uses persistent (false) for error severity", () => {
      const errConfig: NotificationTypeConfig = {
        toast: { mode: "auto", severity: "error" },
      };
      controller.handle(makePush(), errConfig);
      expect(notification).toHaveBeenCalledWith("Test title", expect.objectContaining({ timeout: false }));
    });
  });

  describe("progress mode", () => {
    const config: NotificationTypeConfig = {
      toast: { mode: "progress", severity: "info" },
    };

    it("creates persistent toast on first message", () => {
      controller.handle(makePush(), config);
      expect(notification).toHaveBeenCalledWith("Test title", expect.objectContaining({ timeout: false }));
    });

    it("updates existing toast on subsequent messages", () => {
      controller.handle(makePush(), config);
      controller.handle(makePush({ title: "Updated" }), config);
      expect(notification.update).toHaveBeenCalledWith("toast-id-1", expect.objectContaining({ content: "Updated" }));
    });

    it("completes toast when isComplete returns true", () => {
      const progressConfig: NotificationTypeConfig = {
        toast: {
          mode: "progress",
          severity: "info",
          isComplete: (msg) => !!(msg as any).finished,
          completedType: () => "success",
        },
      };
      controller.handle(makePush(), progressConfig);
      controller.handle(makePush({ ...({} as any), finished: new Date() }), progressConfig);
      expect(notification.update).toHaveBeenCalledWith(
        "toast-id-1",
        expect.objectContaining({ type: "success", timeout: 5000 }),
      );
    });
  });

  describe("silent mode", () => {
    it("does not show any toast", () => {
      const config: NotificationTypeConfig = {
        toast: { mode: "silent" },
      };
      controller.handle(makePush(), config);
      expect(notification).not.toHaveBeenCalled();
    });
  });

  describe("toast: false", () => {
    it("does not show any toast", () => {
      const config: NotificationTypeConfig = {
        toast: false,
      };
      controller.handle(makePush(), config);
      expect(notification).not.toHaveBeenCalled();
    });
  });

  describe("toast key strategy", () => {
    it("uses notifyType + message.id when no groupBy", () => {
      const config: NotificationTypeConfig = {
        toast: { mode: "progress" },
      };
      controller.handle(makePush({ id: "a" }), config);
      controller.handle(makePush({ id: "b" }), config);
      // Two separate toasts created
      expect(notification).toHaveBeenCalledTimes(2);
    });

    it("uses notifyType + groupBy field when groupBy set", () => {
      const config: NotificationTypeConfig = {
        toast: { mode: "progress" },
        groupBy: "profileId",
      };
      const msg1 = makePush({ id: "a" });
      (msg1 as any).profileId = "profile-1";
      const msg2 = makePush({ id: "b" });
      (msg2 as any).profileId = "profile-1";

      controller.handle(msg1, config);
      controller.handle(msg2, config);
      // Same group → one create + one update
      expect(notification).toHaveBeenCalledTimes(1);
      expect(notification.update).toHaveBeenCalledTimes(1);
    });
  });
});
