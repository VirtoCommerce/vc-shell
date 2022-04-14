import { createApp, resolveComponent, h } from "vue";
import { VueSignalR } from "@quangdao/vue-signalr";
import VirtoShellUi from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";
import router from "./router";
import ModPromotions from "./modules/promotions";
import ModDynamicContent from "./modules/dynamic-content";

import * as locales from "./locales";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";

const app = createApp({
  render: () => h(resolveComponent("router-view")),
})
  .use(VueSignalR, {
    url: "/pushNotificationHub",
  })
  .use(VirtoShellUi)
  .use(VirtoShellCore)
  .use(ModPromotions)
  .use(ModDynamicContent);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.use(router);

app.mount("#app");
