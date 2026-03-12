import { createNotificationStore, NotificationStore } from "../store";

let instance: NotificationStore | null = null;

/**
 * Returns the singleton NotificationStore instance.
 * Creates it on first call. All callers share the same store.
 */
export function useNotificationStore(): NotificationStore {
  if (!instance) {
    instance = createNotificationStore();
  }
  return instance;
}

/**
 * Resets the singleton (for testing only).
 * @internal
 */
export function _resetNotificationStore(): void {
  instance = null;
}
