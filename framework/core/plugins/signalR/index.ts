import { App, watch } from "vue";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "../../api/platform";
import { useNotifications } from "./../../composables/useNotifications";
import { useUser } from "../../composables/useUser";
import { useCypressSignalRMock } from "cypress-signalr-mock";

const { addNotification } = useNotifications();

export const signalR = {
  install(
    app: App,
    options?: {
      creator?: string;
    },
  ) {
    const { isAuthenticated } = useUser();
    let reconnect = false;
    const connection =
      useCypressSignalRMock("pushNotificationHub", { enableForVitest: true }) ??
      new HubConnectionBuilder()
        .withUrl("/pushNotificationHub")
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    const start = () => {
      connection
        .start()
        .then(() => {
          console.log("SignalR Connected.");
        })
        .catch((err) => {
          console.log("SignalR Connection Error: ", err);
          setTimeout(() => start(), 5000);
        });
    };

    async function stop() {
      await connection.stop();
    }

    connection.onclose(() => {
      if (reconnect) start();
    });

    connection.on("Send", (message: PushNotification) => {
      addNotification(message);
    });

    if (options?.creator) {
      connection.on("SendSystemEvents", (message: PushNotification) => {
        if (message.creator === options.creator) {
          addNotification(message);
        }
      });
    }

    watch(
      isAuthenticated,
      async (value) => {
        if (value) {
          reconnect = true;
          start();
        } else {
          reconnect = false;
          await stop();
        }
      },
      { immediate: true },
    );
  },
};
