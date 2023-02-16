import { App } from "vue";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default {
  install(app: App): void {
    const connection = new HubConnectionBuilder()
      .withUrl("/pushNotificationHub")
      .configureLogging(LogLevel.Information)
      .build();

    let startedPromise = null;

    function start() {
      startedPromise = connection.start().catch((err) => {
        console.error("Failed to connect", err);
        return new Promise((resolve, reject) =>
          setTimeout(() => start().then(resolve).catch(reject), 5000)
        );
      });
      return startedPromise;
    }
    connection.onclose(() => start());

    start();

    app.config.globalProperties.connection = connection;
    app.provide("connection", app.config.globalProperties.connection);
  },
};
