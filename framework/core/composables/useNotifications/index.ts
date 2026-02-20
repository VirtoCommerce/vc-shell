import { PushNotification, PushNotificationClient } from "@core/api/platform";
import { computed, ComputedRef, ref, onUnmounted } from "vue";
import { orderBy } from "lodash-es";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-notifications");

const notificationsClient = new PushNotificationClient();

/** Notification types excluded from the dropdown history list. */
const EXCLUDED_NOTIFICATION_TYPES = ["IndexProgressPushNotification"];

interface INotifications {
  readonly notifications: ComputedRef<PushNotification[]>;
  readonly moduleNotifications: ComputedRef<PushNotification[]>;
  loadFromHistory(take?: number): Promise<void>;
  addNotification(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  markAllAsRead(): void;
  setNotificationHandler(handler: (notification: PushNotification) => void): void;
}

/**
 * All notifications loaded from history and received via push.
 * This is the source of truth for the notification dropdown.
 */
const notifications = ref<PushNotification[]>([]);

/**
 * Real-time push notifications. Used by module-level subscribers
 * (via `notifyType` parameter) to react to specific notification types.
 */
const pushNotifications = ref<PushNotification[]>([]);

/** Whether any notification in the history list is unread. */
export const hasUnreadNotifications = computed(() => notifications.value.some((item) => item.isNew));

// Global subscribers storage and their handlers
const subscribers = new Map<
  string,
  {
    id: number;
    handler?: (notification: PushNotification) => void;
  }
>();

let subscriberCounter = 0;

/**
 * Composable for managing push notifications.
 *
 * Uses module-level singleton refs so all callers share the same state.
 * When `notifyType` is provided, registers a subscriber that receives
 * real-time notifications of that type and cleans up on unmount.
 */
export function useNotifications(notifyType?: string | string[]): INotifications {
  if (notifyType) {
    const types = Array.isArray(notifyType) ? notifyType : [notifyType];

    // Check existing subscriptions
    types.forEach((type) => {
      if (!subscribers.has(type)) {
        subscribers.set(type, {
          id: ++subscriberCounter,
        });
      }
    });

    onUnmounted(() => {
      types.forEach((type) => {
        subscribers.delete(type);
      });
    });
  }

  /**
   * Loads notification history from the server.
   * Uses raw fetch as a workaround — the generated API client returns incorrect types.
   */
  async function loadFromHistory(take = 10) {
    try {
      const result = await fetch("/api/platform/pushnotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
        body: JSON.stringify({ take }),
      });

      result.text().then((response) => {
        notifications.value = <PushNotification[]>JSON.parse(response).notifyEvents ?? [];
      });
    } catch (e) {
      logger.error("loadFromHistory failed:", e);
      throw e;
    }
  }

  /** Adds or updates a notification in both the history and push lists. */
  function addNotification(message: PushNotification) {
    if (!message.notifyType || !EXCLUDED_NOTIFICATION_TYPES.includes(message.notifyType)) {
      const existsNotification = notifications.value.find((x: PushNotification) => x.id == message.id);
      const existPushNotification = pushNotifications.value.find((x: PushNotification) => x.id == message.id);

      if (existsNotification) {
        message.isNew = existsNotification.isNew;
        Object.assign(existsNotification, message);
      } else {
        notifications.value.push(new PushNotification(message));
      }

      if (existPushNotification) {
        message.isNew = existPushNotification.isNew;
        Object.assign(existPushNotification, message);
      } else {
        pushNotifications.value.push(new PushNotification(message));
      }

      // Check if there is a handler for this type of notification
      if (message.isNew && message.notifyType && subscribers.has(message.notifyType)) {
        const subscriber = subscribers.get(message.notifyType);
        if (subscriber?.handler) {
          subscriber.handler(message);
        }
      }
    }
  }

  /** Marks a single notification as read in both the history and push lists. */
  function markAsRead(message: PushNotification) {
    const inHistory = notifications.value.find((x) => x.id === message.id);
    if (inHistory) {
      inHistory.isNew = false;
    }

    const inPush = pushNotifications.value.find((x) => x.id === message.id);
    if (inPush) {
      inPush.isNew = false;
    }
  }

  async function markAllAsRead() {
    try {
      notifications.value = notifications.value.map((x) => {
        if (x.isNew) {
          x.isNew = false;
        }
        return x;
      });
      pushNotifications.value = pushNotifications.value.map((x) => {
        if (x.isNew) {
          x.isNew = false;
        }
        return x;
      });
      await notificationsClient.markAllAsRead();
    } catch (e) {
      logger.error("markAllAsRead failed:", e);
      throw e;
    }
  }

  function setNotificationHandler(handler: (notification: PushNotification) => void) {
    if (notifyType) {
      const types = Array.isArray(notifyType) ? notifyType : [notifyType];
      types.forEach((type) => {
        const subscriber = subscribers.get(type);
        if (subscriber) {
          subscriber.handler = handler;
        }
      });
    }
  }

  const moduleNotifications = computed(() => {
    if (!notifyType) {
      return [];
    }

    const types = Array.isArray(notifyType) ? notifyType : [notifyType];

    return (
      pushNotifications.value.filter(
        (item: PushNotification) =>
          item.isNew && item.notifyType && types.includes(item.notifyType) && subscribers.has(item.notifyType),
      ) ?? []
    );
  });

  return {
    notifications: computed(() => orderBy(notifications.value, ["created"], ["desc"])),
    moduleNotifications,
    loadFromHistory,
    addNotification,
    markAsRead,
    markAllAsRead,
    setNotificationHandler,
  };
}
