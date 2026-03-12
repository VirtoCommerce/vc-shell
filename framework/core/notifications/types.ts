import { Component, ComputedRef } from "vue";
import { PushNotification } from "@core/api/platform";

export type Severity = "info" | "warning" | "error" | "critical";

export interface ToastConfig {
  mode: "auto" | "progress" | "silent";
  timeout?: number;
  /** For progress mode: determines when the operation is complete. Default: (msg) => !!(msg as any).finished */
  isComplete?: (msg: PushNotification) => boolean;
  /** For progress mode: determines toast type on completion. Default: () => "success" */
  completedType?: (msg: PushNotification) => "success" | "error";
}

export interface NotificationTypeConfig {
  template?: Component;
  severity: Severity | ((msg: PushNotification) => Severity);
  toast: ToastConfig | false;
  groupBy?: string;
}

export interface ModuleNotificationsConfig {
  [notifyType: string]: NotificationTypeConfig;
}

export interface NotificationAction {
  label: string;
  icon?: string;
  handler: () => void;
  visible?: ComputedRef<boolean> | boolean;
}

export interface NotificationSubscription {
  id: number;
  types: string[];
  filter?: (msg: PushNotification) => boolean;
  handler?: (msg: PushNotification) => void;
}

export interface BladeNotificationOptions<T extends PushNotification = PushNotification> {
  types: string[];
  filter?: (msg: T) => boolean;
  onMessage?: (msg: T) => void;
}

export interface BladeNotificationReturn<T extends PushNotification = PushNotification> {
  messages: ComputedRef<T[]>;
  unreadCount: ComputedRef<number>;
  markAsRead: (msg: T) => void;
}

/** Severity → default toast timeout mapping */
export const SEVERITY_TIMEOUTS: Record<Severity, number | false> = {
  info: 5000,
  warning: 8000,
  error: false, // persistent
  critical: false, // persistent
};

export const EXCLUDED_NOTIFICATION_TYPES = ["IndexProgressPushNotification"];
