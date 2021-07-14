import { App } from "vue";
import * as components from "./components";

export const routes = {
  extStoreList: {
    url: "/store",
    component: components.StoreList,
  },
};


export default {
  install(app: App): void {
    // Globally register exported modules
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  },
};

export * from "./components";
export * from "./composables";
