import VirtoShellFramework, { notification, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import ClassicModule from "./modules/classic-module";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

async function startApp() {
  /** !!! uncomment these lines when adding APP_PLATFORM_URL in .env */
  // const { loadUser } = useUser();
  // await loadUser();

  const app = createApp(RouterView)
    .use(VirtoShellFramework, {
      router,
      platformUrl: import.meta.env.APP_PLATFORM_URL,
    })
    // Classic module based on composables, pages and components
    .use(ClassicModule, { router })
    .use(router);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  app.config.errorHandler = (err) => {
    notification.error((err as Error).toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
