import { inject } from "vue";
import { NotificationStoreKey } from "@framework/injection-keys";
import { createNotificationStore, NotificationStore } from "../store";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-notification-store");

/**
 * Returns the NotificationStore instance from the current app context.
 * Falls back to creating a standalone instance when no app context is available
 * (e.g. in unit tests without a mounted app).
 */
export function useNotificationStore(): NotificationStore {
  const injected = inject(NotificationStoreKey, null);
  if (!injected) {
    if (import.meta.env.DEV) {
      logger.warn(
        "useNotificationStore() called without app context. " +
        "A standalone store was created. This is expected in tests but indicates " +
        "a missing provide() in production.",
      );
    }
    return createNotificationStore();
  }
  return injected;
}
