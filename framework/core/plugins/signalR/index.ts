import { App, watch, ref, InjectionKey, inject } from "vue";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "../../api/platform";
import { useNotifications } from "./../../composables/useNotifications";
import { useUserManagement } from "../../composables/useUserManagement";
import { useCypressSignalRMock } from "cypress-signalr-mock";
import { AuthProviderKey } from "../../../injection-keys";
import { IAuthProvider } from "../../types/auth-provider";
import { PlatformAuthProvider } from "../../providers/platform-auth-provider";

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
      authProvider?: IAuthProvider;
    },
  ) {
    // Check if we should enable SignalR (only for platform providers)
    const authProvider = options?.authProvider;

    console.log("[SignalR] Auth provider: ", authProvider);

    // Check if this is a platform provider using instanceof
    if (authProvider && !(authProvider instanceof PlatformAuthProvider)) {
      console.log("[SignalR] Skipping initialization - custom authentication provider detected");
      console.log("[SignalR] SignalR is only available with platform authentication");

      // Provide empty implementations to prevent errors
      app.config.globalProperties.$updateSignalRCreator = () => {
        console.warn("[SignalR] Not available with custom authentication provider");
      };
      app.provide(updateSignalRCreatorSymbol, () => {
        console.warn("[SignalR] Not available with custom authentication provider");
      });

      return;
    }

    console.log("[SignalR] Initializing with platform authentication");
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
