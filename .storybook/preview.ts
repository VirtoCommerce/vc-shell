// import "./../framework";
import { setup, Preview } from "@storybook/vue3-vite";
import framework, { useLanguages, useTheme } from "@vc-shell/framework";
import { createRouter, createWebHashHistory } from "vue-router";
import { vueRouter } from "storybook-vue3-router";
import * as locales from "./assets/locales";
import { watch } from "vue";
import { withGlobalMocks, withVcApp } from "./decorators";
import { mockDefineExtensionPoint, mockUseExtensionPoint } from "./storybook-globals";

// Import framework styles
// - In production (CI/CD): uses compiled CSS from framework/dist/index.css (after yarn build)
// - In development: resolved via alias to SCSS sources from framework/assets/styles/index.scss
import "@vc-shell/framework/dist/index.css";

// Make extension points available globally for components that import them directly
if (typeof window !== "undefined") {
  (window as any).defineExtensionPoint = mockDefineExtensionPoint;
  (window as any).useExtensionPoint = mockUseExtensionPoint;
}

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
    withVcApp,
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
    a11y: {
      // Fail stories (and the Vitest a11y run) on any violation.
      test: "error",
      // Axe run options — mirrors scripts/a11y-audit.mjs exactly (see
      // framework/ui/ACCESSIBILITY.md).
      // NOTE: rule overrides must live HERE (run options), not in `config.rules`:
      // `runOnly` re-enables every rule carrying the listed tags, overriding
      // `axe.configure`-level disables — only run-option `rules` win over it.
      options: {
        // Scope checks to the documented WCAG 2.1 A/AA target. Axe
        // "best-practice" rules (landmark-unique, empty-table-header, …) are
        // intentionally out of scope.
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        rules: {
          // Storybook decorators add extra wrapper elements that break landmark rules
          region: { enabled: false },
          // Color contrast is governed by the product's brand palette and is
          // tracked as a separate design decision, not a per-component code fix.
          "color-contrast": { enabled: false },
        },
      },
    },
  },

  tags: ["autodocs"],
};
export default preview;
