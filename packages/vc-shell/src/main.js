import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import App from "./App.vue";
import "./assets/styles/main.less";

Vue.use(VueCompositionAPI);

new Vue({
  el: "#app",
  render: h => h(App)
});
