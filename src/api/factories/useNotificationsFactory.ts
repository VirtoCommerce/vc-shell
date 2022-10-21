import { PushNotification, PushNotificationClient } from "@vc-shell/api-client";
import { IUseNotificationsFactoryParams } from "@vc-shell/core";

const notificationsClient = new PushNotificationClient();

const useNotificationsFactory = (): IUseNotificationsFactoryParams => {
  const setAuthToken = (token: string) => {
    notificationsClient.setAuthToken(token);
  };

  const getPushNotifications = async (token: string, take: number) => {
    const result = await fetch("/api/platform/pushnotifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
        Accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ take }),
    });

    return result.text().then((response) => {
      return <PushNotification[]>JSON.parse(response).notifyEvents ?? [];
    });
  };

  const markAllAsRead = () => {
    return notificationsClient.markAllAsRead();
  };

  return {
    setAuthToken,
    getPushNotifications,
    markAllAsRead,
  };
};

export default useNotificationsFactory;
