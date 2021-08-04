import { createApp } from "vue";
import App from "./App.vue";
import VirtoShellUi, {
  VcLayoutWorkspace,
  VcLayoutLogin,
  VcLayoutDashboard,
} from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";

import * as locales from "./locales";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtoshell/ui/dist/ui.css";
import "@virtoshell/ui-theme-light/dist/theme.css";

const app = createApp(App)
  .use(VirtoShellUi)
  .use(VirtoShellCore, {
    router: {
      routes: [
        { path: "/", component: VcLayoutDashboard },
        { path: "/login", component: VcLayoutLogin },
        { path: "/:pathMatch(.*)*", component: VcLayoutWorkspace },
      ],
    },
  });

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.mount("#app");
