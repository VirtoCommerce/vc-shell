import { createRouter, createWebHashHistory } from "vue-router";

import { routes } from "./routes";

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.APP_BASE_PATH),
  routes: [],
});

routes.forEach((route) => router.addRoute(route));
