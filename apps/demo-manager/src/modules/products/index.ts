import { App } from "vue";
import * as pages from "./pages";
import * as locales from "./locales";
import { useRouter } from "@virtoshell/core";

export default {
  install(app: App): void {
    const { registerBlade } = useRouter();

    // Register exported pages
    Object.entries(pages).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // Setup routing
    registerBlade({
      name: "products-list",
      url: "products",
      component: pages.ProductsList,
    });
    registerBlade({
      name: "products-add",
      url: "product-add",
      component: pages.ProductsAdd,
    });
    registerBlade({
      name: "products-edit",
      url: "product-edit",
      component: pages.ProductsEdit,
    });

    // Load locales
    Object.entries(locales).forEach(([key, message]) => {
      app.config.globalProperties.$mergeLocaleMessage(key, message);
    });
  },
};

export * from "./pages";
export * from "./composables";
