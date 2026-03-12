import { App, watch, ref, InjectionKey } from "vue";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "@core/notifications";
import { useUserManagement } from "@core/composables/useUserManagement";
import { useCypressSignalRMock } from "cypress-signalr-mock";
import { createLogger } from "@core/utilities";

const logger = createLogger("signalR");

const store = useNotificationStore();
const currentCreator = ref<string | undefined>();

let mountComplete = false;
let pendingStart = false;
let _startFn: (() => void) | null = null;

export const updateSignalRCreatorSymbol: InjectionKey<(creator: string | undefined) => void> =
  Symbol("updateSignalRCreator");

function setupSystemEventsHandler(connection: any, creator?: string) {
  // Unsubscribe from the previous handler if it was
  connection.off("SendSystemEvents");

  // Subscribe to events with the new creator
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
      if (!mountComplete) {
        pendingStart = true;
        return;
      }
      connection
        .start()
        .then(() => {
          logger.info("Connected.");
          setupSystemEventsHandler(connection, currentCreator.value);
        })
        .catch((err) => {
          logger.error("Connection Error: ", err);
          setTimeout(() => start(), 5000);
        });
    };

    _startFn = start;

    async function stop() {
      await connection.stop();
    }

    connection.onclose(() => {
      if (reconnect) start();
    });

    connection.on("Send", (message: PushNotification) => {
      store.ingest(message);
    });

    // Watch for changes in the creator
    watch(
      currentCreator,
      (newCreator) => {
        if (newCreator && connection.state === "Connected") {
          setupSystemEventsHandler(connection, newCreator);
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
          pendingStart = false; // Cancel any pending deferred start
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

export function notifyMountComplete(): void {
  mountComplete = true;
  if (pendingStart && _startFn) {
    pendingStart = false;
    _startFn();
  }
}
