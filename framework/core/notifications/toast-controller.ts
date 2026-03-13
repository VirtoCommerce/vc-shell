import { PushNotification } from "@core/api/platform";
import { notification } from "@shared/components/notifications/core";
import { NotificationTypeConfig, Severity, SEVERITY_TIMEOUTS } from "./types";

/** PushNotification with dynamic properties (subclasses add extra fields at runtime via constructor) */
type PushNotificationRecord = PushNotification & Record<string, unknown>;

interface ActiveToast {
  toastId: string | number;
}

function resolveSeverity(
  config: NotificationTypeConfig,
  msg: PushNotification,
): Severity {
  return typeof config.severity === "function"
    ? config.severity(msg)
    : config.severity;
}

function resolveToastKey(
  msg: PushNotification,
  config: NotificationTypeConfig,
): string {
  const type = msg.notifyType ?? "unknown";
  if (config.groupBy) {
    const groupValue = (msg as PushNotificationRecord)[config.groupBy] ?? "default";
    return `${type}::${groupValue}`;
  }
  return `${type}::${msg.id}`;
}

const defaultIsComplete = (msg: PushNotification) =>
  !!(msg as PushNotificationRecord).finished;

export interface IToastController {
  handle(
    message: PushNotification,
    config: NotificationTypeConfig,
    markAsReadFn?: (msg: PushNotification) => void,
  ): void;
}

export function createToastController(): IToastController {
  const activeToasts = new Map<string, ActiveToast>();

  function handle(
    message: PushNotification,
    config: NotificationTypeConfig,
    markAsReadFn?: (msg: PushNotification) => void,
  ) {
    if (!config.toast) return;
    if (config.toast.mode === "silent") return;

    const severity = resolveSeverity(config, message);

    if (config.toast.mode === "auto") {
      handleAuto(message, severity, config, markAsReadFn);
    } else if (config.toast.mode === "progress") {
      handleProgress(message, severity, config, markAsReadFn);
    }
  }

  function handleAuto(
    message: PushNotification,
    severity: Severity,
    config: NotificationTypeConfig,
    markAsReadFn?: (msg: PushNotification) => void,
  ) {
    const timeout =
      config.toast && typeof config.toast !== "boolean" && config.toast.timeout != null
        ? config.toast.timeout
        : SEVERITY_TIMEOUTS[severity];

    notification(message.title ?? "", {
      timeout,
      type: severity === "critical" ? "error" : severity === "info" ? "default" : severity,
      onClose() {
        markAsReadFn?.(message);
      },
    });
  }

  function handleProgress(
    message: PushNotification,
    severity: Severity,
    config: NotificationTypeConfig,
    markAsReadFn?: (msg: PushNotification) => void,
  ) {
    const toastConfig = config.toast as Exclude<typeof config.toast, false>;
    const key = resolveToastKey(message, config);
    const isComplete = toastConfig.isComplete ?? defaultIsComplete;

    if (isComplete(message)) {
      // Completion
      const active = activeToasts.get(key);
      if (active) {
        const completedType = toastConfig.completedType?.(message) ?? "success";
        notification.update(active.toastId, {
          type: completedType,
          timeout: 5000,
          content: message.title ?? "",
          onClose() {
            markAsReadFn?.(message);
          },
        });
        activeToasts.delete(key);
      }
      return;
    }

    const active = activeToasts.get(key);
    if (active) {
      // Update existing
      notification.update(active.toastId, {
        content: message.title ?? "",
      });
    } else {
      // Create new persistent toast
      const toastId = notification(message.title ?? "", {
        timeout: false,
        type: severity === "critical" ? "error" : severity === "info" ? "default" : severity,
      });
      if (toastId != null) {
        activeToasts.set(key, { toastId });
      }
    }
  }

  return { handle };
}

