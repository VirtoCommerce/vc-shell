import { setNotificationBackend } from "@core/notifications/notification";
import { useContainer } from "@shell/_internal/notifications/composables/useContainer";

/**
 * Registers the shell notification backend (useContainer) with the core notification API.
 * Called once during framework initialization.
 */
export function registerNotificationBackend(): void {
  const container = useContainer();
  setNotificationBackend({
    defaultOptions: container.defaultOptions,
    actions: container.actions,
    getAllNotifications: container.getAllNotifications,
    appendInstance: container.appendInstance,
    getNotification: (id) => container.getNotification(id),
    hasNotification: (id) => container.hasNotification(id),
  });
}
