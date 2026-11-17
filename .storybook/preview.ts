// import "./../framework";
import { setup, Preview } from "@storybook/vue3-vite";
import framework, { useLanguages } from "@vc-shell/framework";
import { createRouter, createWebHashHistory } from "vue-router";
import { vueRouter } from "storybook-vue3-router";
import * as locales from "./assets/locales";
import { withGlobalMocks, withVcApp } from "./decorators";
import { mockDefineExtensionPoint, mockUseExtensionPoint } from "./storybook-globals";
import { transformSource } from "./source-snippet";
import { DocsPage } from "./docs-page";
import { globalTypes, initialGlobals, withGlobals } from "./globals";

// Import framework styles
// - In production (CI/CD): uses compiled CSS from framework/dist/index.css (after yarn build)
// - In development: resolved via alias to SCSS sources from framework/assets/styles/index.scss
import "@vc-shell/framework/dist/index.css";

// Make extension points available globally for components that import them directly
if (typeof window !== "undefined") {
  (window as any).defineExtensionPoint = mockDefineExtensionPoint;
  (window as any).useExtensionPoint = mockUseExtensionPoint;
  // Blades call the `defineBlade` compile-time macro in their setup; only the app build replaces it.
  (window as any).defineBlade ??= () => undefined;
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
  globalTypes,
  initialGlobals,

  decorators: [vueRouter(), withGlobalMocks, withVcApp, withGlobals],

  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    docs: {
      page: DocsPage,
      // The usage guide sits below every story; the table of contents makes it reachable.
      toc: { headingSelector: "h2, h3", title: "On this page" },
      source: { transform: transformSource },
      // "Code" tab next to Controls on every story, with the same snippet as "Show code".
      codePanel: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      // Fail stories (and the Vitest a11y run) on any violation.
      test: "error",
      // Axe run options — mirrors scripts/a11y-audit.mjs (see framework/ui/ACCESSIBILITY.md).
      // Rule overrides must live here, not in `config.rules`: `runOnly` re-enables every
      // rule carrying the listed tags, and only run-option `rules` win over it.
      options: {
        // Scope checks to WCAG 2.2 A/AA. Axe "best-practice" rules are out of scope.
        //
        // The 2.2 tags matter: with only the 2.1 tags a run reports clean while the whole
        // 2.2 class (target-size, dragging-movements) is never evaluated. Keep this list
        // and scripts/a11y-audit.mjs identical.
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"] },
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
