import {
  PushNotification,
  PushNotificationClient,
  PushNotificationSearchCriteria,
} from "@virtoshell/api-client";
import useUser from "../useUser";
import { computed, ComputedRef, readonly, ref } from "vue";
import useLogger from "../useLogger";
import _ from "lodash";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  readonly notifications: ComputedRef<Readonly<PushNotification[]>>;
  readonly popupNotifications: ComputedRef<Readonly<PushNotification[]>>;
  loadFromHistory(take?: number): void;
  addNotification(message: PushNotification): void;
  markAsReaded(sage: PushNotification): void;
  dismiss(message: PushNotification): void;
  dismissAll(): void;
}

const notifications = ref<PushNotification[]>([]);
const popupNotifications = ref<PushNotification[]>([]);

export default (): INotifications => {
  const { getAccessToken, user } = useUser();
  const logger = useLogger();

  async function loadFromHistory(take = 10) {
    const token = await getAccessToken();
    if (token) {
      try {
        notificationsClient.setAuthToken(token);
        const result = await notificationsClient.searchPushNotification({
          take,
        } as PushNotificationSearchCriteria);

        notifications.value = result.notifyEvents ?? [];
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }
  }

  function addNotification(message: PushNotification) {
    if (
      message.creator === user.value?.userName ||
      message.creator === user.value?.id
    ) {
      const existsNotification = notifications.value.find(
        (x) => x.id == message.id
      );
      if (existsNotification) {
        message.isNew = existsNotification.isNew;
        Object.assign(existsNotification, message);
      } else {
        popupNotifications.value.unshift(Object.assign({}, message));
        notifications.value.unshift(message);
      }
    }
  }
  function markAsReaded(message: PushNotification) {
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

  return {
    notifications: computed(() =>
      readonly(_.orderBy(notifications.value, ["created"], ["desc"]))
    ),
    popupNotifications: computed(() => readonly(popupNotifications.value)),
    loadFromHistory,
    addNotification,
    dismissAll,
    dismiss,
    markAsReaded,
  };
};
