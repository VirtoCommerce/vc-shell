/**
 * Shared WeakMap that allows useAsync to register a deferred toast notification,
 * and ErrorInterceptor to cancel it when the same error is caught for blade banner display.
 *
 * This decouples the two modules — neither imports the other directly.
 *
 * IMPORTANT: This module must NOT have top-level imports from @shared/components
 * because it is transitively imported by useAsync (in the @core/composables barrel),
 * and @shared/components/notifications pulls in @ui/components which imports from
 * @core/composables — creating a circular dependency.
 */

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
      // Lazy import to avoid circular dependency at module load time.
      // In practice, clearTimeout above is sufficient since the deferred
      // setTimeout(0) hasn't fired yet when this runs synchronously from
      // ErrorInterceptor's onErrorCaptured. The remove() is a safety net.
      import("@shared/components/notifications/core/notification").then(({ notification }) => {
        notification.remove(entry.notifId);
      });
      pending.delete(error);
      return true;
    }
  }
  return false;
}
