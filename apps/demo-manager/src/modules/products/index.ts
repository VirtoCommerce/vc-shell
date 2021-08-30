import { App } from "vue";
import * as pages from "./pages";
import * as locales from "./locales";

export default {
  install(app: App): void {
    const router = app.config.globalProperties.$router;

    // Register exported pages
    Object.entries(pages).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // Setup routing
    router.addRoute("root", {
      name: "products-list",
      path: "products",
      component: pages.ProductsList,
    });

    // Load locales
    Object.entries(locales).forEach(([key, message]) => {
      app.config.globalProperties.$mergeLocaleMessage(key, message);
    });
  },
};

export * from "./pages";
export * from "./composables";
