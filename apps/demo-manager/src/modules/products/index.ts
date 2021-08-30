import { App } from "vue";
import * as pages from "./pages";

export default {
  install(app: App): void {
    const router = app.config.globalProperties.$router;

    // Register exported pages
    Object.entries(pages).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    router.addRoute("root", {
      name: "products-list",
      path: "products",
      component: pages.ProductsList,
    });
  },
};

export * from "./pages";
