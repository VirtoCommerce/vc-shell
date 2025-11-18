import { RouteRecordRaw } from "vue-router";
import App from "../App.vue";
import { BladeVNode, useBladeNavigation } from "@vc-shell/framework";
import Dashboard from "./Dashboard.vue";

/**
 * Example route configuration for VC-Shell application
 * Register dashboard as the root route
 */
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: App,
    name: "App",
    meta: {
      root: true,
    },
    children: [
      {
        name: "Dashboard",
        path: "",
        component: Dashboard,
      },
    ],
  },
  // Catch-all route for blade navigation
  {
    path: "/:pathMatch(.*)*",
    component: App,
    beforeEnter: async (to) => {
      const { routeResolver } = useBladeNavigation();
      return routeResolver(to);
    },
  },
];
