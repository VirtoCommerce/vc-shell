import { App } from "vue";
import * as components from "./components";
import { useBlade } from "@virtoshell/core";

interface IModuleOptions {
  ordersList?: Record<string, unknown>;
  ordersDetails?: Record<string, unknown>;
}

export default {
  install(app: App, options: IModuleOptions): void {
    const { registerBlade } = useBlade();

    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    registerBlade({
      name: "orders-list",
      url: "/orders",
      component: components.Orders,
      componentOptions: options?.ordersList,
    });

    registerBlade({
      name: "orders-details",
      url: "order/:id",
      component: components.Order,
      componentOptions: options?.ordersDetails,
    });
  },
};

export * from "./components";
export * from "./composables";
