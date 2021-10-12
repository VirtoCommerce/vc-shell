import { createApp } from "vue";
import App from "./App.vue";
import VirtoShellUi from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";
import ModAssets from "@virtoshell/mod-assets";
import ModOrders from "./modules/orders";
import ModProducts from "./modules/products";
import ModOffers from "./modules/offers";

import * as locales from "./locales";

// Load required CSS
import "@virtoshell/ui/dist/ui.css";

const app = createApp(App)
  .use(VirtoShellUi)
  .use(VirtoShellCore)
  .use(ModAssets)
  .use(ModOrders)
  .use(ModProducts)
  .use(ModOffers);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.mount("#app");
