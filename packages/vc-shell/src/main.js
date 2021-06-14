import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import App from "./App.vue";
import VueRouter from "vue-router";
import "./assets/styles/main.less";

Vue.use(VueCompositionAPI);

const router = new VueRouter({
  mode: "history",
  routes: [{ path: "/ws/:alias", component: App }]
});

new Vue({
  el: "#app",
  router,
  render: h => h(App)
});
