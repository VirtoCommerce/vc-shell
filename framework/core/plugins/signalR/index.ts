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

    // Retrying a rejected negotiate every 5s forever produced a console full of
    // 401s and never recovered: without a fresh cookie the answer cannot change.
    // Back off instead, and give up entirely once the failure is an auth failure —
    // the fetch interceptor sees the same 401 and is already signing the user out.
    const RETRY_BASE_MS = 5000;
    const RETRY_MAX_MS = 60000;
    let retryAttempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    function isUnauthorized(err: unknown): boolean {
      // @microsoft/signalr reports the negotiate status in the error message only.
      return err instanceof Error && /\b401\b/.test(err.message);
    }

    const start = () => {
      connection
        .start()
        .then(() => {
          retryAttempt = 0;
          logger.info("Connected.");
        })
        .catch((err: unknown) => {
          logger.error("Connection Error: ", err);

          if (isUnauthorized(err)) {
            logger.warn("Not authenticated — stopping reconnect attempts until sign-in.");
            return;
          }

          const delay = Math.min(RETRY_BASE_MS * 2 ** retryAttempt, RETRY_MAX_MS);
          retryAttempt++;
          retryTimer = setTimeout(() => start(), delay);
        });
    };

    async function stop() {
      // A pending retry would otherwise outlive the sign-out that stopped us and
      // reconnect against a session that is gone.
      clearTimeout(retryTimer);
      retryTimer = undefined;
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
          // A fresh sign-in starts from the base delay rather than inheriting the
          // backoff the previous session ended on.
          retryAttempt = 0;
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
