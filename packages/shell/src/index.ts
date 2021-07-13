import { App } from "vue";
import * as components from "./components";

export default {
  install(app: App, { extensions }: IShellOptions): void {
    // Register provided extensions
    extensions.forEach((ext) => app.use(ext));

    // Globally register exported modules
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  },
};

export * from "./components";
export * from "./composables";
