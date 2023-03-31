import { PushNotification, PushNotificationClient } from "./../../api";
import { useUser } from "./../";
import { computed, ComputedRef, readonly, ref } from "vue";
import { orderBy, remove } from "lodash-es";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  readonly notifications: ComputedRef<Readonly<PushNotification[]>>;
  readonly popupNotifications: ComputedRef<Readonly<PushNotification[]>>;
  loadFromHistory(take?: number): void;
  addNotification(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  dismiss(message: PushNotification): void;
  dismissAll(): void;
  markAllAsRead(): void;
}

const notifications = ref<PushNotification[]>([]);
const popupNotifications = ref<PushNotification[]>([]);

export default (): INotifications => {
  const { getAccessToken } = useUser();

  async function loadFromHistory(take = 10) {
    const token = await getAccessToken();
    if (token) {
      // TODO temporary workaround to get push notifications without base type
      try {
        notificationsClient.setAuthToken(token);
        const result = await fetch("/api/platform/pushnotifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json-patch+json",
            Accept: "application/json",
            authorization: `Bearer ${token}`,
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
  }

  function addNotification(message: PushNotification) {
    if (message.notifyType !== "IndexProgressPushNotification") {
      const existsNotification = notifications.value.find((x) => x.id == message.id);

      if (existsNotification) {
        message.isNew = existsNotification.isNew;
        Object.assign(existsNotification, message);
      } else {
        popupNotifications.value.unshift(message);
        notifications.value.unshift(message);
      }
    }
  }

  function markAsRead(message: PushNotification) {
    message.isNew = false;
    remove(popupNotifications.value, (x) => x.id == message.id);
  }

  function dismiss(message: PushNotification) {
    remove(popupNotifications.value, (x) => x.id == message.id);
    remove(notifications.value, (x) => x.id == message.id);
  }

  function dismissAll() {
    popupNotifications.value = [];
    notifications.value = [];
  }

  async function markAllAsRead() {
    const token = await getAccessToken();
    if (token) {
      notificationsClient.setAuthToken(token);
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
  }

  return {
    notifications: computed(() => readonly(orderBy(notifications.value, ["created"], ["desc"]))),
    popupNotifications: computed(() => readonly(popupNotifications.value)),
    loadFromHistory,
    addNotification,
    dismissAll,
    dismiss,
    markAsRead,
    markAllAsRead,
  };
};
