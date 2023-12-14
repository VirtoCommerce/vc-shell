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

    connection.onclose(() => {
      start();
    });

    start();

    connection.on("Send", (message: PushNotification) => {
      addNotification(message);
    });
  },
};
