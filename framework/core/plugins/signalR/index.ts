import { App, watch, ref, InjectionKey } from "vue";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "@core/api/platform";
import { useNotificationStore, type NotificationStore } from "@core/notifications";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useCypressSignalRMock } from "cypress-signalr-mock";
import { createLogger } from "@core/utilities";

const logger = createLogger("signalR");

const currentCreator = ref<string | undefined>();

export const updateSignalRCreatorSymbol: InjectionKey<(creator: string | undefined) => void> =
  Symbol("updateSignalRCreator");

function setupSystemEventsHandler(connection: any, store: NotificationStore, creator?: string) {
  connection.off("SendSystemEvents");

  if (creator) {
    logger.debug("Setup handler for creator: ", creator);
    connection.on("SendSystemEvents", (message: PushNotification) => {
      if (message.creator === creator) {
        store.ingest(message);
      }
    });
  }
}

export const signalR = {
  install(
    app: App,
    options?: {
      creator?: string;
    },
  ) {
    currentCreator.value = options?.creator;
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
          setupSystemEventsHandler(connection, store, currentCreator.value);
        })
        .catch((err) => {
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

    watch(
      currentCreator,
      (newCreator) => {
        if (newCreator && connection.state === "Connected") {
          setupSystemEventsHandler(connection, store, newCreator);
        }
      },
      { immediate: true },
    );

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

    app.config.globalProperties.$updateSignalRCreator = (creator: string | undefined) => {
      currentCreator.value = creator;
    };
    app.provide(updateSignalRCreatorSymbol, (creator: string | undefined) => {
      currentCreator.value = creator;
    });
  },
};
