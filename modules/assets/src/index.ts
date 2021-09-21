import { App } from "vue";
import * as pages from "./pages";
import * as locales from "./locales";
import { useRouter } from "@virtoshell/core";

export default {
  install(app: App): void {
    const { registerBlade } = useRouter();

    // Setup routing
    registerBlade({
      name: "assets-details",
      component: pages.AssetsDetails,
    });

    // Load locales
    Object.entries(locales).forEach(([key, message]) => {
      app.config.globalProperties.$mergeLocaleMessage(key, message);
    });
  },
};

export * from "./pages";
