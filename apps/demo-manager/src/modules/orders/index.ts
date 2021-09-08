import { App } from "vue";
import * as pages from "./pages";
import { useRouter } from "@virtoshell/core";

interface IModuleOptions {
  ordersList?: Record<string, unknown>;
  ordersDetails?: Record<string, unknown>;
}

export default {
  install(app: App, options: IModuleOptions): void {
    const { registerBlade } = useRouter();

    // Register exported pages
    Object.entries(pages).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    registerBlade({
      name: "orders-list",
      url: "orders",
      component: pages.OrdersList,
      componentOptions: options?.ordersList,
    });

    registerBlade({
      name: "orders-details",
      url: "order-edit",
      component: pages.OrdersEdit,
      componentOptions: options?.ordersDetails,
    });
  },
};

export * from "./pages";
export * from "./composables";
