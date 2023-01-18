import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import {
  usePermissions,
  useUser,
  ExtendedComponent,
} from "@vc-shell/framework";

/**
 * Pages
 */
import Dashboard from "../pages/Dashboard.vue";
import Invite from "../pages/Invite.vue";
import ResetPassword from "../pages/ResetPassword.vue";
import Login from "./../pages/Login.vue";
import App from "./../pages/App.vue";

/**
 * Modules
 */
import { DefaultList } from "../modules/default";

// eslint-disable-next-line import/no-unresolved
import whiteLogoImage from "/assets/logo-white.svg";
// eslint-disable-next-line import/no-unresolved
import bgImage from "/assets/background.jpg";

const { checkPermission } = usePermissions();

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: App,
    name: "App",
    children: [
      {
        name: "Dashboard",
        path: "",
        alias: "/",
        component: Dashboard,
      },
      /**
       * Modules routes
       */
      {
        name: "Default",
        path: "default",
        props: true,
        component: DefaultList,
      },
    ],
    beforeEnter: [checkAuth],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      logo: whiteLogoImage,
      background: bgImage,
      title: "Vendor Portal",
    },
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
    redirect: "/",
  },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.APP_BASE_PATH as string),
  routes,
});

let programmatic = false;
["push", "replace", "go", "back", "forward"].forEach((methodName) => {
  const method = router[methodName];
  router[methodName] = (...args) => {
    programmatic = true;
    method.apply(router, args);
  };
});

router.beforeEach((to, from, next) => {
  const ExtendedComponent = to.matched[to.matched.length - 1]?.components
    ?.default as ExtendedComponent;

  if (from.name === undefined || programmatic) {
    if (ExtendedComponent && ExtendedComponent.permissions) {
      if (checkPermission(ExtendedComponent.permissions)) {
        next();
      } else {
        if (!from.matched.length) {
          next({ name: "Dashboard" });
        } else {
          // TODO temporary access alert
          alert("Access restricted");
        }
      }
    } else {
      next();
    }
  } else {
    // do not route if user clicks back/forward button in browser
    next(false);
  }
  programmatic = false;
});

async function checkAuth(to, from, next) {
  const { getAccessToken } = useUser();

  const token = await getAccessToken();

  if (!token && to.name !== "Login") {
    next({ name: "Login" });
  } else {
    next();
  }
}
