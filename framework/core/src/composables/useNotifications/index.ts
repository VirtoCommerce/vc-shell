import {
  PushNotification,
  PushNotificationClient,
  PushNotificationSearchResult,
} from "@virtoshell/api-client";
import useUser from "../useUser";
import { computed, ComputedRef, ref } from "vue";
import useLogger from "../useLogger";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  notifications: ComputedRef<PushNotification[]>;
  getLastNotifications(): Promise<void>;
  updateNotifications(message: PushNotification): void;
}

export default (): INotifications => {
  const { getAccessToken } = useUser();
  const logger = useLogger();
  const notificationsSearchResult = ref<PushNotificationSearchResult>();
  const notifications = ref<PushNotification[]>([]);

  async function getLastNotifications() {
    const token = await getAccessToken();
    if (token) {
      try {
        notificationsClient.setAuthToken(token);
        notificationsSearchResult.value =
          await notificationsClient.searchPushNotification(
            null,
            undefined,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            undefined,
            10
          );
        if (
          notificationsSearchResult.value &&
          notificationsSearchResult.value.notifyEvents &&
          notificationsSearchResult.value.notifyEvents.length
        ) {
          notifications.value.push(
            ...notificationsSearchResult.value.notifyEvents
          );
        }
      } catch (e) {
        logger.error(e);
        throw e;
      }
    }
  }

  function updateNotifications(message: PushNotification) {
    notifications.value.unshift(message);
  }

  return {
    notifications: computed(() => notifications.value),
    getLastNotifications,
    updateNotifications,
  };
};
