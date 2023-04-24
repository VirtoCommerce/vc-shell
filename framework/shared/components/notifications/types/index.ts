export type NotificationType = "success" | "error" | "warning" | "default";

export interface NotificationOptions {
  limit?: number;
  pauseOnHover?: boolean;
  timeout?: number | boolean;
  content?: string;
  notificationId?: number | string;
  type?: NotificationType;
  closeNotification?(): void;
  onOpen?: <T>(payload: T) => void;
  onClose?: <T>(payload: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: string | Record<string, any>;
  updateId?: string | number;
}
