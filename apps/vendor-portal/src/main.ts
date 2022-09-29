import { createApp, resolveComponent, h } from "vue";
import VirtoShellUi from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";
import ModAssets from "@virtoshell/mod-assets";
import ModOrders from "./modules/orders";
import ModProducts from "./modules/products";
import ModOffers from "./modules/offers";
import ModImport from "./modules/import";
import ModSettings from "./modules/settings";
import router from "./router";
import PushHub from "./config/push-hub";

import * as locales from "./locales";

// Load required CSS
import "./styles/index.scss";
import "@virtoshell/ui/dist/style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";

const app = createApp({
  render: () => h(resolveComponent("router-view")),
})
  .use(PushHub)
  .use(VirtoShellUi)
  .use(VirtoShellCore)
  .use(ModAssets)
  .use(ModOrders)
  .use(ModProducts)
  .use(ModOffers)
  .use(ModImport)
  .use(ModSettings);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.use(router);

app.mount("#app");
