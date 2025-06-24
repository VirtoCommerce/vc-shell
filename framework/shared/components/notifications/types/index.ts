/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { VNode, DefineComponent } from "vue";

export type NotificationType = "success" | "error" | "warning" | "default";

export interface NotificationOptions {
  limit?: number;
  pauseOnHover?: boolean;
  timeout?: number | boolean;
  content?: Content;
  notificationId?: number | string;
  type?: NotificationType;
  onOpen?: <T>(payload: T) => void;
  onClose?: <T>(payload: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: string | Record<string, any>;
  updateId?: string | number;
  position?: NotificationPosition;
}

// Now InternalNotificationOptions doesn't need closeNotification
export type InternalNotificationOptions = NotificationOptions;

// Adding a new type for notification positioning
export type NotificationPosition =
  | "top-center"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

export type Content = string | VNode | DefineComponent<{}, {}, any>;
