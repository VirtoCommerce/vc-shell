import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import App from "./../pages/App.vue";
import {
  usePermissions,
  useUser,
  BladePageComponent,
  notification,
  Invite,
  Login,
  ResetPassword,
  useBladeNavigation,
} from "@vc-shell/framework";
import { useCookies } from "@vueuse/integrations/useCookies";
// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";
import { inject } from "vue";

const routes: RouteRecordRaw[] = [
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
        alias: "/",
        component: Dashboard,
      },
    ],
  },
  {
    name: "Login",
    path: "/login",
    component: Login,
    props: () => ({
      logo: whiteLogoImage,
      background: bgImage,
      title: "Vendor Portal",
    }),
  },
  {
    name: "Invite",
    path: "/invite",
    component: Invite,
    props: (route) => ({
      userId: route.query.userId,
      token: route.query.token,
      userName: route.query.userName,
    }),
  },
  {
    name: "ResetPassword",
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
  const { fetchUserPermissions, checkPermission } = usePermissions();
  const { resolveBlades } = useBladeNavigation();
  const { getAccessToken } = useUser();

  const pages = inject<BladePageComponent[]>("pages");

  const resolvedBladeUrl = resolveBlades(to);

  try {
    const token = await getAccessToken();
    const azureAdCookie = useCookies([".AspNetCore.Identity.Application"]).get(".AspNetCore.Identity.Application");

    // Fetching permissions if not any
    if (token) await fetchUserPermissions();

    const component = pages.find((blade) => blade?.url === to.path);

    const hasAccess = checkPermission(component?.permissions);

    if (!(token || azureAdCookie) && to.name !== "Login") {
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
    throw new Error(e.message);
  }
});
