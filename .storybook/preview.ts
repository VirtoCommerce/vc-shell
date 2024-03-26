// import "@vc-shell/framework/dist/index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { setup, Preview } from "@storybook/vue3";
import { useBreakpoints } from "@vueuse/core";
import framework, { useLanguages } from "@vc-shell/framework";
import { createRouter, createWebHashHistory } from "vue-router";
import { vueRouter } from "storybook-vue3-router";
import * as locales from "./assets/locales";
import "./../framework/assets/styles/index.scss";

setup((app) => {
  app.use(framework, {
    router: createRouter({
      history: createWebHashHistory(),
      routes: [],
    }),
    platformUrl: "",
  });

  const { currentLocale, setLocale } = useLanguages();

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  setLocale(currentLocale.value);
});

const preview: Preview = {
  decorators: [vueRouter()],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};
export default preview;
