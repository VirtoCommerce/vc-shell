import { createApp, resolveComponent, h } from "vue";
import { VueSignalR } from "@quangdao/vue-signalr";
import VirtoShellUi from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";
import router from "./router";

import * as locales from "./locales";

// Load required CSS
import "@virtoshell/ui/dist/ui.css";

const app = createApp({
  render: () => h(resolveComponent("router-view")),
})
  .use(VueSignalR, {
    url: "/pushNotificationHub",
  })
  .use(VirtoShellUi)
  .use(VirtoShellCore);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.use(router);

app.mount("#app");
