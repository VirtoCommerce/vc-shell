import { computed, ComputedRef, getCurrentScope, onScopeDispose } from "vue";
import { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "@core/notifications";
import { orderBy } from "lodash-es";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-notifications");

export interface UseNotificationsReturn {
  readonly notifications: ComputedRef<PushNotification[]>;
  readonly moduleNotifications: ComputedRef<PushNotification[]>;
  loadFromHistory(take?: number): Promise<void>;
  addNotification(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  markAllAsRead(): void;
  setNotificationHandler(handler: (notification: PushNotification) => void): void;
}

/** @deprecated Use UseNotificationsReturn instead */
export type INotifications = UseNotificationsReturn;

/** @deprecated Use useNotificationStore().hasUnread instead */
export const hasUnreadNotifications = {
  get value() {
    return useNotificationStore().hasUnread.value;
  },
};

/**
 * @deprecated Use `useBladeNotifications()` for blade-level subscriptions
 * or `useNotificationStore()` for direct store access.
 */
export function useNotifications(notifyType?: string | string[]): UseNotificationsReturn {
  if (import.meta.env.DEV) {
    logger.warn(
      "[vc-shell] useNotifications() is deprecated. Use useBladeNotifications() instead. " +
      "See: MIGRATION_GUIDE.md#notifications",
    );
  }

  const store = useNotificationStore();
  const types = notifyType
    ? Array.isArray(notifyType) ? notifyType : [notifyType]
    : [];

  let handler: ((msg: PushNotification) => void) | undefined;

  // Subscribe if types provided
  let unsub: (() => void) | undefined;
  if (types.length) {
    unsub = store.subscribe({
      types,
      handler: (msg) => handler?.(msg),
    });

    if (getCurrentScope()) {
      onScopeDispose(() => unsub?.());
    }
  }

  const moduleNotifications = computed(() => {
    if (!types.length) return [];
    return store.realtime.value.filter(
      (item) =>
        item.isNew &&
        item.notifyType != null &&
        types.includes(item.notifyType),
    );
  });

  return {
    notifications: computed(() => orderBy(store.history.value, ["created"], ["desc"])),
    moduleNotifications,
    loadFromHistory: store.loadHistory,
    addNotification: store.ingest,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    setNotificationHandler: (fn) => { handler = fn; },
  };
}
