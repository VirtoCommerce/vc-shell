import VirtoShellFramework from "@vc-shell/framework";
import { createApp } from "vue";
import PushHub from "./config/push-hub";
import Default from "./modules/default";
import EmptyRouterView from "./pages/EmptyRouterView.vue";
import { router } from "./router";
import * as locales from "./locales";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/style.css";

const app = createApp(EmptyRouterView)
  .use(router)
  .use(PushHub)
  .use(VirtoShellFramework)
  .use(Default);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.mount("#app");
