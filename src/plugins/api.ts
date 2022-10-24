import * as factories from "../api/factories";
import { App } from "vue";

export default {
  install: (app: App) => {
    Object.entries(factories).forEach(([factoryName, cb]) => {
      app.config.globalProperties[factoryName] = cb();
      app.provide(factoryName, app.config.globalProperties[factoryName]);
    });
  },
};
