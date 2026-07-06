import { defineConfig } from "vitest/config";

// Multi-project setup:
//  - framework/vitest.config.ts        — unit tests (jsdom)
//  - vitest.config.storybook.ts        — Storybook story tests (real browser via
//    @storybook/addon-vitest; each story renders + runs its play function and axe a11y checks)
//
// NOTE: the projects MUST be referenced as config files here. An inline project
// object would not load vitest.config.storybook.ts, silently dropping the
// storybookTest plugin (and with it the Storybook vite aliases), which breaks
// every story test with unresolved `@core/...` imports.
export default defineConfig({
  test: {
    projects: ["./framework/vitest.config.ts", "./vitest.config.storybook.ts"],
  },
});
