import { describe, it, expect, beforeEach, vi } from "vitest";
import { createToastController } from "./toast-controller";
import { PushNotification } from "@core/api/platform";
import { NotificationTypeConfig } from "./types";

// Mock the notification imperative API
vi.mock("@shared/components/notifications/core", () => {
  const notificationFn = vi.fn(() => "toast-id-1");
  notificationFn.success = vi.fn(() => "toast-id-s");
  notificationFn.error = vi.fn(() => "toast-id-e");
  notificationFn.warning = vi.fn(() => "toast-id-w");
  notificationFn.update = vi.fn();
  notificationFn.remove = vi.fn();
  return { notification: notificationFn };
});

import { notification } from "@shared/components/notifications/core";

function makePush(overrides: Partial<PushNotification> = {}): PushNotification {
  return new PushNotification({
    id: "msg-1",
    notifyType: "TestEvent",
    title: "Test title",
    isNew: true,
    created: new Date(),
    ...overrides,
  });
}

describe("ToastController", () => {
  let controller: ReturnType<typeof createToastController>;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = createToastController();
  });

  describe("auto mode", () => {
    const config: NotificationTypeConfig = {
      severity: "info",
      toast: { mode: "auto" },
    };

    it("shows a toast with severity-based timeout", () => {
      controller.handle(makePush(), config);
      expect(notification).toHaveBeenCalledWith(
        "Test title",
        expect.objectContaining({ timeout: 5000 }),
      );
    });

    it("uses warning timeout for warning severity", () => {
      const warnConfig: NotificationTypeConfig = {
        severity: "warning",
        toast: { mode: "auto" },
      };
      controller.handle(makePush(), warnConfig);
      expect(notification).toHaveBeenCalledWith(
        "Test title",
        expect.objectContaining({ timeout: 8000 }),
      );
    });

    it("uses persistent (false) for error severity", () => {
      const errConfig: NotificationTypeConfig = {
        severity: "error",
        toast: { mode: "auto" },
      };
      controller.handle(makePush(), errConfig);
      expect(notification).toHaveBeenCalledWith(
        "Test title",
        expect.objectContaining({ timeout: false }),
      );
    });
  });

  describe("progress mode", () => {
    const config: NotificationTypeConfig = {
      severity: "info",
      toast: { mode: "progress" },
    };

    it("creates persistent toast on first message", () => {
      controller.handle(makePush(), config);
      expect(notification).toHaveBeenCalledWith(
        "Test title",
        expect.objectContaining({ timeout: false }),
      );
    });

    it("updates existing toast on subsequent messages", () => {
      controller.handle(makePush(), config);
      controller.handle(makePush({ title: "Updated" }), config);
      expect(notification.update).toHaveBeenCalledWith(
        "toast-id-1",
        expect.objectContaining({ content: "Updated" }),
      );
    });

    it("completes toast when isComplete returns true", () => {
      const progressConfig: NotificationTypeConfig = {
        severity: "info",
        toast: {
          mode: "progress",
          isComplete: (msg) => !!(msg as any).finished,
          completedType: () => "success",
        },
      };
      controller.handle(makePush(), progressConfig);
      controller.handle(
        makePush({ ...({} as any), finished: new Date() }),
        progressConfig,
      );
      expect(notification.update).toHaveBeenCalledWith(
        "toast-id-1",
        expect.objectContaining({ type: "success", timeout: 5000 }),
      );
    });
  });

  describe("silent mode", () => {
    it("does not show any toast", () => {
      const config: NotificationTypeConfig = {
        severity: "info",
        toast: { mode: "silent" },
      };
      controller.handle(makePush(), config);
      expect(notification).not.toHaveBeenCalled();
    });
  });

  describe("toast: false", () => {
    it("does not show any toast", () => {
      const config: NotificationTypeConfig = {
        severity: "info",
        toast: false,
      };
      controller.handle(makePush(), config);
      expect(notification).not.toHaveBeenCalled();
    });
  });

  describe("toast key strategy", () => {
    it("uses notifyType + message.id when no groupBy", () => {
      const config: NotificationTypeConfig = {
        severity: "info",
        toast: { mode: "progress" },
      };
      controller.handle(makePush({ id: "a" }), config);
      controller.handle(makePush({ id: "b" }), config);
      // Two separate toasts created
      expect(notification).toHaveBeenCalledTimes(2);
    });

    it("uses notifyType + groupBy field when groupBy set", () => {
      const config: NotificationTypeConfig = {
        severity: "info",
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
