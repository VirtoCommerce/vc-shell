import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit, { VcWorkspacePage, VcLoginPage } from "@virtoshell/ui";
import VirtoShellCore, { useI18n } from "@virtoshell/core";
import { createRouter, createWebHashHistory } from "vue-router";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtoshell/ui/dist/ui.css";
import "@virtoshell/ui-theme-light/dist/theme.css";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/login", component: VcLoginPage },
    { path: "/:pathMatch(.*)*", component: VcWorkspacePage },
  ],
});

const app = createApp(App).use(VirtoShellCore).use(VcUiKit).use(router);

// const i18n = useI18n();
// i18n.loadLocaleMessages();

app.mount("#app");
