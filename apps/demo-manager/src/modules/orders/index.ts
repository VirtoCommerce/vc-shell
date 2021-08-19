import { App } from "vue";
import * as components from "./components";

export default {
  install(app: App): void {
    const router = app.config.globalProperties.$router;

    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    router.addRoute({
      name: "orders",
      path: "/orders",
      component: components.Orders,
      children: [{ path: "order/:id", component: components.Order }],
    });
  },
};

export * from "./components";
