import VirtoShellFramework, { notification, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import { Offers } from "./modules";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

async function startApp() {
  const { loadUser } = useUser();

  await loadUser();

  const app = createApp(RouterView);
  app.use(VirtoShellFramework, {
    router,
    platformUrl: import.meta.env.APP_PLATFORM_URL,
  });
  app.use(Offers, { router });
  app.use(router);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  // Global error handler
  app.config.errorHandler = (err) => {
    notification.error(err.toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
