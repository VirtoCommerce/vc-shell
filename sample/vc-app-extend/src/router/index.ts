import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { inject } from "vue";
import {
  usePermissions,
  useUser,
  BladePageComponent,
  notification,
  useBladeNavigation,
  Login,
  ResetPassword,
  Invite,
} from "@vc-shell/framework";

/**
 * Pages
 */
import App from "./../pages/App.vue";

// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";
import { useLogin } from "../composables";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: App,
    name: "App",
    meta: {
      root: true,
    },
    children: [],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    props: () => ({
      composable: useLogin,
      logo: whiteLogoImage,
      background: bgImage,
      title: "vc-app",
    }),
  },
  {
    name: "invite",
    path: "/invite",
    component: Invite,
    props: (route) => ({
      userId: route.query.userId,
      token: route.query.token,
      userName: route.query.userName,
    }),
  },
  {
    name: "resetpassword",
    path: "/resetpassword",
    component: ResetPassword,
    props: (route) => ({
      userId: route.query.userId,
      token: route.query.token,
      userName: route.query.userName,
    }),
  },
  {
    path: "/:pathMatch(.*)*",
    component: App,
    beforeEnter: (to) => {
      const { resolveUnknownRoutes } = useBladeNavigation();

      return resolveUnknownRoutes(to);
    },
  },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.APP_BASE_PATH as string),
  routes,
});

router.beforeEach(async (to, from) => {
  const { hasAccess: _hasAccess } = usePermissions();
  const { resolveBlades } = useBladeNavigation();
  const { isAuthenticated } = useUser();
  const pages = inject<BladePageComponent[]>("pages");
  const resolvedBladeUrl = resolveBlades(to);

  if (to.name !== "Login" && to.name !== "ResetPassword" && to.name !== "Invite") {
    try {
      const component = pages.find((blade) => blade?.url === to.path);

      const hasAccess = _hasAccess(component?.permissions);

      if (!(await isAuthenticated()) && to.name !== "Login") {
        return { name: "Login" };
      } else if (hasAccess && to.name !== "Login") {
        return resolvedBladeUrl ? resolvedBladeUrl : true;
      } else if (!hasAccess) {
        notification.error("Access restricted", {
          timeout: 3000,
        });
        return from.path;
      }
    } catch (e) {
      return { name: "Login" };
    }
  } else return true;
});
