import { App } from "vue";
import * as components from "./components";

export default {
  install(app: App): void {
    // Register exported pages
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  },
};

export * from "./components";
export * from "./composables";
export * from "./types";
