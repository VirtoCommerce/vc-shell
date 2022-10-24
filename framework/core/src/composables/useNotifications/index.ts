import {
  PushNotification,
} from "@vc-shell/api-client";
import useUser from "../useUser";
import { computed, ComputedRef, inject, readonly, ref } from "vue";
import useLogger from "../useLogger";
import _ from "lodash-es";
import { IUseNotificationsFactoryParams } from "../../types";

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
  const useNotificationsFactory = inject<IUseNotificationsFactoryParams>(
    "useNotificationsFactory"
  );
  const { getAccessToken } = useUser();
  const logger = useLogger();

  async function loadFromHistory(take = 10) {
    const token = await getAccessToken();
    if (token) {
      // TODO temporary workaround to get push notifications without base type
      try {
        useNotificationsFactory.setAuthToken(token);

        notifications.value =
          await useNotificationsFactory.getPushNotifications(token, take);
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }
  }

  function addNotification(message: PushNotification) {
    if (message.notifyType !== "IndexProgressPushNotification") {
      const existsNotification = notifications.value.find(
        (x) => x.id == message.id
      );

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
    _.remove(popupNotifications.value, (x) => x.id == message.id);
  }

  function dismiss(message: PushNotification) {
    _.remove(popupNotifications.value, (x) => x.id == message.id);
    _.remove(notifications.value, (x) => x.id == message.id);
  }

  function dismissAll() {
    popupNotifications.value = [];
    notifications.value = [];
  }

  async function markAllAsRead() {
    const token = await getAccessToken();
    if (token) {
      useNotificationsFactory.setAuthToken(token);
      try {
        await useNotificationsFactory.markAllAsRead();
        notifications.value = notifications.value.map((x) => {
          if (x.isNew) {
            x.isNew = false;
          }
          return x;
        });
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }
  }

  return {
    notifications: computed(() =>
      readonly(_.orderBy(notifications.value, ["created"], ["desc"]))
    ),
    popupNotifications: computed(() => readonly(popupNotifications.value)),
    loadFromHistory,
    addNotification,
    dismissAll,
    dismiss,
    markAsRead,
    markAllAsRead,
  };
};
