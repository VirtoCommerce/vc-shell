import * as pages from "./pages";
import * as locales from "./locales";
import { createModule } from "@vc-shell/framework";
import { App } from "vue";

export default {
  install(app: App): void {
    // Register pages
    Object.entries(pages).forEach(([, page]) => {
      app.config.globalProperties.pages?.push(page);
    });

    const module = createModule(pages, locales);
    module.install(app);
  },
};

export * from "./pages";
export * from "./components";
export * from "./composables";
