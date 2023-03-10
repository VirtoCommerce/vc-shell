import { createLogger, LogLevel } from "vue-logger-plugin";

export default createLogger({
  enabled: import.meta.env.APP_LOG_ENABLED === "true",
  level: (import.meta.env.APP_LOG_LEVEL ?? "debug") as LogLevel,
});
