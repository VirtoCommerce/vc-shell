import { PushNotification, PushNotificationClient } from "./../../api/platform";
import { computed, ComputedRef, ref, onUnmounted } from "vue";
import * as _ from "lodash-es";
import { createLogger } from "../../utilities";

const logger = createLogger("use-notifications");

const notificationsClient = new PushNotificationClient();

interface INotifications {
  readonly notifications: ComputedRef<PushNotification[]>;
  readonly moduleNotifications: ComputedRef<PushNotification[]>;
  loadFromHistory(take?: number): Promise<void>;
  addNotification(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  markAllAsRead(): void;
  setNotificationHandler(handler: (notification: PushNotification) => void): void;
}

const notifications = ref<PushNotification[]>([]);
const pushNotifications = ref<PushNotification[]>([]);

// Global subscribers storage and their handlers
const subscribers = new Map<
  string,
  {
    id: number;
    handler?: (notification: PushNotification) => void;
  }
>();

let subscriberCounter = 0;

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

  async function loadFromHistory(take = 10) {
    // TODO temporary workaround to get push notifications without base type
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

  function addNotification(message: PushNotification) {
    if (message.notifyType !== "IndexProgressPushNotification") {
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

  function markAsRead(message: PushNotification) {
    const exists = pushNotifications.value.find((x) => x.id === message.id);
    if (exists) {
      Object.assign(exists, { ...message, isNew: false });
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
    notifications: computed(() => _.orderBy(notifications.value, ["created"], ["desc"])),
    moduleNotifications,
    loadFromHistory,
    addNotification,
    markAsRead,
    markAllAsRead,
    setNotificationHandler,
  };
}
