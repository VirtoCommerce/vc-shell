import { App } from "vue";
import {
  VueLogger,
  createLogger,
  VueLoggerInstance,
} from "vuejs3-logger/dist/index.d";

const options = {
  isEnabled: import.meta.env.APP_LOG_ENABLED === "true",
  logLevel: import.meta.env.APP_LOG_LEVEL ?? "debug",
};
export function init(app: App): App {
  console.debug(`[@vc-shell/framework#useLogger:init] - Entry point`);
  app.use(VueLogger, options);

  return app;
}

export default function useLogger(): VueLoggerInstance {
  console.debug(`[@vc-shell/framework#useLogger] - Entry point`);
  return createLogger(options);
}
