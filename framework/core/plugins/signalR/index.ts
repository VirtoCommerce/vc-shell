import { App, watch, ref, InjectionKey } from "vue";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "../../api/platform";
import { useNotifications } from "./../../composables/useNotifications";
import { useUserManagement } from "../../composables/useUserManagement";
import { useCypressSignalRMock } from "cypress-signalr-mock";

const { addNotification } = useNotifications();
const currentCreator = ref<string | undefined>();

export const updateSignalRCreatorSymbol: InjectionKey<(creator: string | undefined) => void> =
  Symbol("updateSignalRCreator");

function setupSystemEventsHandler(connection: any, creator?: string) {
  // Unsubscribe from the previous handler if it was
  connection.off("SendSystemEvents");

  // Subscribe to events with the new creator
  if (creator) {
    console.log("[SignalR] Setup handler for creator: ", creator);
    connection.on("SendSystemEvents", (message: PushNotification) => {
      if (message.creator === creator) {
        addNotification(message);
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
      connection
        .start()
        .then(() => {
          console.log("[SignalR] Connected.");
          setupSystemEventsHandler(connection, currentCreator.value);
        })
        .catch((err) => {
          console.log("[SignalR] Connection Error: ", err);
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
