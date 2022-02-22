import { App } from "vue";
import {
  createLogger,
  LogLevel,
  useLogger as useVueLogger,
  VueLogger,
} from "vue-logger-plugin";

export function init(app: App): App {
  console.debug(`[@virtoshell/core#useLogger:init] - Entry point`);
  app.use(
    createLogger({
      enabled: process.env.VUE_APP_LOG_ENABLED === "true",
      level: (process.env.VUE_APP_LOG_LEVEL ?? "debug") as LogLevel,
    })
  );

  return app;
}

export default function useLogger(): VueLogger {
  console.debug(`[@virtoshell/core#useLogger] - Entry point`);
  return useVueLogger();
}
