import { App } from "vue";
import * as components from "./components";

import "./styles/index.less";

export default {
  install(app: App): void {
    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    app.config.globalProperties.$VcLoading = components.VcLoading;

    app.provide('VcLoading', components.VcLoading);
  }
}

export * from "./components";
