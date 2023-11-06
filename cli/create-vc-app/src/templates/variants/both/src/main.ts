import VirtoShellFramework, { notification, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import ClassicModule from "./modules/classic-module";
import DynamicModule from "./modules/dynamic-module";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

async function startApp() {
  const { loadUser } = useUser();

  await loadUser();

  const app = createApp(RouterView)
    .use(VirtoShellFramework)
    // Classic module based on composables, pages and components
    .use(ClassicModule, { router })
    // Dynamic module based on page schemas
    .use(DynamicModule, { router })
    .use(router);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  app.provide("platformUrl", import.meta.env.APP_PLATFORM_URL);

  app.config.errorHandler = (err) => {
    notification.error(err.toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
