/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { VNode, DefineComponent, InjectionKey, Ref } from "vue";

export type NotificationType = "success" | "error" | "warning" | "default";

export interface NotificationOptions {
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
  /** Set by `actions.dismiss()` to trigger exit animation in VcToast */
  dismissing?: boolean;
}

// Adding a new type for notification positioning
export type NotificationPosition =
  | "top-center"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

export type Content = string | VNode | DefineComponent<{}, {}, any>;

export interface NotificationContainerState {
  notificationContainers: Record<NotificationPosition, Ref<NotificationOptions[]>>;
  actions: {
    remove(id: string | number): void;
    clear(): void;
  };
}

export const NotificationContainerStateKey: InjectionKey<NotificationContainerState> = Symbol("NotificationContainerState");
