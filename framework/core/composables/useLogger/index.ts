import { useLogger as useVueLogger, VueLogger } from "vue-logger-plugin";

/** @deprecated use `useLogger()` directly from `vue-logger-plugin` */
export default function useLogger(): VueLogger {
  console.debug(`[@vc-shell/framework#useLogger] - Entry point`);
  return useVueLogger();
}
