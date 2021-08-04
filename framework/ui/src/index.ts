import { App } from "vue";
import * as components from "./components";

import "./styles/index.less";

export default {
  install(app: App): void {
    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    app.config.globalProperties.$VcLoader = components.VcLoader;

    app.provide("VcLoader", components.VcLoader);
  },
};

export * from "./components";
