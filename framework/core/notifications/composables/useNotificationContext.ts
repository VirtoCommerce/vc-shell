import { inject, type ComputedRef } from "vue";
import { PushNotification } from "@core/api/platform";
import { NotificationContextKey } from "../types";

export function useNotificationContext<
  T extends PushNotification = PushNotification,
>(): ComputedRef<T> {
  const ctx = inject(NotificationContextKey);
  if (!ctx) {
    throw new Error(
      "useNotificationContext() must be used inside a notification template",
    );
  }
  return ctx as ComputedRef<T>;
}
