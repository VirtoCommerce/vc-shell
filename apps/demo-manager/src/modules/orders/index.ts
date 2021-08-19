import { App } from "vue";
import * as components from "./components";

interface IModuleOptions {
  router?: [Record<string, unknown>];
}

export default {
  install(app: App, options: IModuleOptions): void {
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

    if (options?.router) {
      options?.router.forEach((item) => router.addRoute(item));
    }
  },
};

export * from "./components";
