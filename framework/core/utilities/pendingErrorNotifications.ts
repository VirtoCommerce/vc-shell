/**
 * Shared WeakMap that allows useAsync to register a deferred toast notification,
 * and ErrorInterceptor to cancel it when the same error is caught for blade banner display.
 *
 * This decouples the two modules — neither imports the other directly.
 */

import { notification } from "@shared/components/notifications/core/notification";

interface PendingNotification {
  timerId: ReturnType<typeof setTimeout>;
  notifId: string;
}

const pending = new WeakMap<object, PendingNotification>();

/**
 * Register a deferred error notification for an error object.
 * Called by useAsync after scheduling a setTimeout for the toast.
 */
export function setPendingErrorNotification(
  error: object,
  timerId: ReturnType<typeof setTimeout>,
  notifId: string,
): void {
  pending.set(error, { timerId, notifId });
}

/**
 * Cancel a deferred error notification for an error object.
 * Called by ErrorInterceptor when it catches the error and will show a blade banner instead.
 * Returns true if a pending notification was found and cancelled.
 */
export function cancelPendingErrorNotification(error: unknown): boolean {
  if (error && typeof error === "object") {
    const entry = pending.get(error);
    if (entry) {
      clearTimeout(entry.timerId);
      notification.remove(entry.notifId);
      pending.delete(error);
      return true;
    }
  }
  return false;
}
