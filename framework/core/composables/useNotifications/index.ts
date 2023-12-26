import { PushNotification, PushNotificationClient } from "./../../api/platform";
import { useUser } from "./../useUser";
import { computed, ComputedRef, ref } from "vue";
import * as _ from "lodash-es";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  readonly notifications: ComputedRef<PushNotification[]>;
  readonly moduleNotifications: ComputedRef<PushNotification[]>;
  loadFromHistory(take?: number): Promise<void>;
  addNotification(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  markAllAsRead(): void;
}

const notifications = ref<PushNotification[]>([]);
const pushNotifications = ref<PushNotification[]>([]);

export function useNotifications(notifyType?: string | string[]): INotifications {
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
      console.error(e);
      throw e;
    }
  }

  function addNotification(message: PushNotification) {
    if (message.notifyType !== "IndexProgressPushNotification") {
      const existsNotification = notifications.value.find((x: PushNotification) => x.id == message.id);
      const existPushNotification = pushNotifications.value.find((x) => x.id == message.id);

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
      await notificationsClient.markAllAsRead();
      notifications.value = notifications.value.map((x) => {
        if (x.isNew) {
          x.isNew = false;
        }
        return x;
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const moduleNotifications = computed(
    () =>
      pushNotifications.value.filter(
        (item: PushNotification) =>
          item.isNew && !!item.notifyType && !!notifyType && notifyType.includes(item.notifyType),
      ) ?? [],
  );

  return {
    notifications: computed(() => _.orderBy(notifications.value, ["created"], ["desc"])),
    moduleNotifications,
    loadFromHistory,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}
