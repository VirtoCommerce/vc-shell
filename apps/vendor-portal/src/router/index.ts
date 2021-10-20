import { createRouter, createWebHistory } from "vue-router";
import App from "../pages/App.vue";
import Invite from "../pages/Invite.vue";

const routes = [
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
    path: "/:catchAll(.*)",
    component: App,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
