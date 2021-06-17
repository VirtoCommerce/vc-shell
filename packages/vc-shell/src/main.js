import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import App from "./App.vue";
import { default as installAddons, routes } from './addons';
import "./assets/styles/main.less";

Vue.use(VueCompositionAPI);

new Vue({
  el: "#app",
  render: h => h(App),

  beforeCreate: function () {
    installAddons();
    console.log('Routes: ', routes);
  }
});
