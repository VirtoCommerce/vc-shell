import { RouteRecordRaw } from "vue-router";
import App from "../pages/App.vue";
import { Invite, Login, ResetPassword, useBladeNavigation } from "@vc-shell/framework";
// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";
import { useLogin } from "../composables";
import Dashboard from "../pages/Dashboard.vue";

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
      composable: useLogin,
      logo: whiteLogoImage,
      background: bgImage,
      title: "Scaffolded App",
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
    beforeEnter: async (to) => {
      const { routeResolver } = useBladeNavigation();
      return routeResolver(to);
    },
  },
];
