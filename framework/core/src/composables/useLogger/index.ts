import { App } from "vue";
import {
  createLogger,
  LogLevel,
  useLogger as useVueLogger,
  VueLogger,
} from "vue-logger-plugin";

export function init(app: App): App {
  console.debug(`[@virto-shell/core#useLogger:init] - Entry point`);
  app.use(
    createLogger({
      enabled: import.meta.env.APP_LOG_ENABLED === "true",
      level: (import.meta.env.APP_LOG_LEVEL ?? "debug") as LogLevel,
    })
  );

  return app;
}

export default function useLogger(): VueLogger {
  console.debug(`[@virto-shell/core#useLogger] - Entry point`);
  return useVueLogger();
}
