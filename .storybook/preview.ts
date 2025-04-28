// import "@vc-shell/framework/dist/index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { setup, Preview } from "@storybook/vue3";
import { useBreakpoints } from "@vueuse/core";
import framework, { useLanguages, useTheme } from "./../framework";
import { createRouter, createWebHashHistory } from "vue-router";
import { vueRouter } from "storybook-vue3-router";
import * as locales from "./assets/locales";
import "./../framework/assets/styles/index.scss";
import { ref, watch, reactive } from "vue";
import { withGlobalMocks } from "./decorators";

setup((app) => {
    app.use(framework, {
    router: createRouter({
      history: createWebHashHistory(),
      routes: [],
    }),
  });

  const { currentLocale, setLocale } = useLanguages();

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  setLocale(currentLocale.value);
});

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    vueRouter(),
    withGlobalMocks,
    (story, context) => {
      const theme = context.globals.theme || "light";
      return {
        template: `<div>
          <story/>
        </div>`,
        setup: () => {
          const { setTheme } = useTheme();

          watch(
            () => theme,
            (theme) => {
              setTheme(theme);
            },
            { immediate: true },
          );
        },
      };
    },
  ],
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
