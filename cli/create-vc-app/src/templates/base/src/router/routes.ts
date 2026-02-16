import { RouteRecordRaw } from "vue-router";
import App from "../pages/App.vue";
import Dashboard from "../pages/Dashboard.vue";
import { Invite, Login, ResetPassword, ForgotPassword, ChangePasswordPage } from "@vc-shell/framework";
// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";

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
        alias: `/`,
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
      // background: bgImage,
      title: "{{AppNameSentenceCase}}",
    }),
  },
  {
    name: "Invite",
    path: "/invite",
    component: Invite,
    props: (_route) => ({
      userId: _route.query.userId,
      token: _route.query.token,
      userName: _route.query.userName,
      logo: whiteLogoImage,
      // background: bgImage,
    }),
  },
  {
    name: "ResetPassword",
    path: "/resetpassword",
    component: ResetPassword,
    props: (_route) => ({
      userId: _route.query.userId,
      token: _route.query.token,
      userName: _route.query.userName,
      logo: whiteLogoImage,
      // background: bgImage,
    }),
  },
  {
    name: "ForgotPassword",
    path: "/forgot-password",
    component: ForgotPassword,
    props: () => ({
      logo: whiteLogoImage,
      // background: bgImage,
    }),
  },
  {
    name: "ChangePassword",
    path: "/changepassword",
    component: ChangePasswordPage,
    meta: {
      forced: true,
    },
    props: (_route) => ({
      forced: _route.meta.forced,
      logo: whiteLogoImage,
      // background: bgImage,
    }),
  },
];
