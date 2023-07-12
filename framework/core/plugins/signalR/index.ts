import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PushNotification } from "../../api/platform";
import { useNotifications } from "./../../composables/useNotifications";

const { addNotification } = useNotifications();

export const signalR = {
  install() {
    const connection = new HubConnectionBuilder()
      .withUrl("/pushNotificationHub")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    let startedPromise = null;

    function start() {
      startedPromise = connection.start().catch((err) => {
        console.error("Failed to connect", err);
        return new Promise((resolve, reject) => setTimeout(() => start().then(resolve).catch(reject), 5000));
      });
      return startedPromise;
    }
    connection.onclose(() => start());

    start();

    connection.on("Send", (message: PushNotification) => {
      addNotification(message);
    });
  },
};
