import {
  PushNotification,
  PushNotificationClient,
  PushNotificationSearchResult,
} from "@virtoshell/api-client";
import useUser from "../useUser";
import { useSignalR } from "@quangdao/vue-signalr";
import { computed, ComputedRef, ref } from "vue";
import useLogger from "../useLogger";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  notifications: ComputedRef<PushNotification[]>;
  getLastNotifications: () => Promise<void>;
}

export default (): INotifications => {
  const signalr = useSignalR();
  const { user, getAccessToken } = useUser();
  const logger = useLogger();
  const notificationsSearchResult = ref<PushNotificationSearchResult>();
  const notifications = ref<PushNotification[]>([]);

  signalr.on("Send", (message: PushNotification) => {
    if (
      message.creator === user.value?.userName ||
      message.creator === user.value?.id
    ) {
      notifications.value.unshift(message);
    }
  });

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

  return {
    notifications: computed(() => notifications.value),
    getLastNotifications,
  };
};
