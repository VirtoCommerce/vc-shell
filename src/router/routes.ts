import { RouteRecordRaw } from "vue-router";
import App from "../pages/App.vue";
import { BladeVNode, Invite, Login, ResetPassword, useBladeNavigation } from "@vc-shell/framework";
// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";
import { useLogin } from "../composables";
import Dashboard from "../pages/Dashboard.vue";

const version = import.meta.env.PACKAGE_VERSION;

const sellerIdRegex = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

export const routes: RouteRecordRaw[] = [
  {
    path: `/:sellerId(${sellerIdRegex})?`,
    component: App,
    name: "App",
    meta: {
      root: true,
    },
    children: [
      {
        name: "Dashboard",
        path: "",
        alias: `/:sellerId(${sellerIdRegex})?`,
        component: Dashboard,
      },
    ],
    beforeEnter: (to) => {
      const { sellerId } = to.params;

      if (!sellerId || new RegExp(sellerIdRegex).test(sellerId as string)) {
        return true;
      } else {
        return { path: (to.matched[1].components?.default as BladeVNode).type.url as string };
      }
    },
  },
  {
    name: "Login",
    path: "/login",
    component: Login,
    meta: {
      appVersion: version,
    },
    props: () => ({
      composable: useLogin,
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
    path: `/:sellerId(${sellerIdRegex})?/:pathMatch(.*)*`,
    component: App,
    beforeEnter: async (to) => {
      const { routeResolver } = useBladeNavigation();
      return routeResolver(to);
    },
  },
];
