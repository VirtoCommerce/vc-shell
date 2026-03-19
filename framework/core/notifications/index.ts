export { useNotificationStore } from "./composables/useNotificationStore";
export { useBladeNotifications } from "./composables/useBladeNotifications";
export { createNotificationStore, type NotificationStore } from "./store";
export { createToastController, type IToastController } from "./toast-controller";
export type {
  Severity,
  ToastConfig,
  NotificationTypeConfig,
  ModuleNotificationsConfig,
  NotificationAction,
  BladeNotificationOptions,
  BladeNotificationReturn,
} from "./types";
export { SEVERITY_TIMEOUTS, EXCLUDED_NOTIFICATION_TYPES } from "./types";

// Imperative notification API
export { notification } from "./notification";

// Toast UI types (NotificationOptions, Content, NotificationPosition, etc.)
export * from "./toast-types";
