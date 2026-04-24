import { type App, watch } from "vue";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "@core/notifications";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useCypressSignalRMock } from "cypress-signalr-mock";
import { createLogger } from "@core/utilities";

const logger = createLogger("signalR");

export const signalR = {
  install(_app: App) {
    const store = useNotificationStore();
    const { isAuthenticated } = useUserManagement();
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
          logger.info("Connected.");
        })
        .catch((err: unknown) => {
          logger.error("Connection Error: ", err);
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
      store.ingest(message);
    });

    connection.on("SendSystemEvents", (message: PushNotification) => {
      store.ingest(message, { broadcast: true });
    });

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
