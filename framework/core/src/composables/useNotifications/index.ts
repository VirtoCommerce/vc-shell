import {
  PushNotificationClient,
  PushNotificationSearchResult,
} from "@virtoshell/api-client";
import useUser from "../useUser";
import { computed, ComputedRef, ref } from "vue";

const notificationsClient = new PushNotificationClient();

interface INotifications {
  lastNotifications: ComputedRef<PushNotificationSearchResult | undefined>;
  getLastNotifications: () => Promise<void>;
}

export default (): INotifications => {
  const { getAccessToken } = useUser();
  const notifications = ref<PushNotificationSearchResult>();

  async function getLastNotifications() {
    const token = await getAccessToken();
    if (token) {
      try {
        notificationsClient.setAuthToken(token);
        notifications.value = await notificationsClient.searchPushNotification(
          null,
          false,
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
      } catch (e) {
        // TODO error log
      }
    }
  }

  return {
    lastNotifications: computed(() => notifications.value),
    getLastNotifications,
  };
};
