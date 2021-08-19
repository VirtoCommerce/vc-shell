import { createApp } from "vue";
import App from "./App.vue";
import VirtoShellUi from "@virtoshell/ui";
import VirtoShellCore from "@virtoshell/core";
import LoginPage from "./components/login-page.vue";
import Workspace from "./components/workspace.vue";
import ModOrders from "./modules/orders";

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
        {
          name: "login",
          path: "/login",
          component: LoginPage,
        },
        {
          name: "root",
          path: "/",
          component: Workspace,
        },
      ],
    },
  })
  .use(ModOrders);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.mount("#app");
