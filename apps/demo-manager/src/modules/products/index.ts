import { App } from "vue";
import * as pages from "./pages";
import * as locales from "./locales";

export default {
  install(app: App): void {
    Object.entries(pages).forEach(([pageName, page]) => {
      app.component(pageName, page);
      app.config.globalProperties.pages?.push(page);
    });

    // Load locales
    Object.entries(locales).forEach(([key, message]) => {
      app.config.globalProperties.$mergeLocaleMessage(key, message);
    });
  },
};

export * from "./pages";
export * from "./composables";
