import { App } from "vue";
import {
  createLogger,
  useLogger as useVueLogger,
  VueLogger,
} from "vue-logger-plugin";

export function init(app: App): App {
  app.use(
    createLogger({
      enabled: process.env.VUE_APP_LOG_ENABLED ?? true,
      level: process.env.VUE_APP_LOG_LEVEL ?? "debug",
    })
  );

  return app;
}

export default function useLogger(): VueLogger {
  return useVueLogger();
}
