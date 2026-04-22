import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { normalizePath } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const frameworkRoot = normalizePath(resolve(__dirname, "./"));
const frameworkAliases = {
  "@": frameworkRoot,
  "@framework": frameworkRoot,
  "@core": `${frameworkRoot}/core`,
  "@core/": `${frameworkRoot}/core/`,
  "@ui": `${frameworkRoot}/ui`,
  "@ui/": `${frameworkRoot}/ui/`,
  "@assets": `${frameworkRoot}/assets`,
  "@assets/": `${frameworkRoot}/assets/`,
  "@locales": `${frameworkRoot}/locales`,
  "@locales/": `${frameworkRoot}/locales/`,
  "@shell": `${frameworkRoot}/shell`,
  "@shell/": `${frameworkRoot}/shell/`,
  "@modules": `${frameworkRoot}/modules`,
  "@modules/": `${frameworkRoot}/modules/`,
  "@vc-shell/framework/": `${frameworkRoot}/`,
  "@vc-shell/framework": resolve(__dirname, "./index.ts"),
};

const sourceCoverageInclude = [
  "core/**/*.{ts,vue}",
  "ui/**/*.{ts,vue}",
  "shell/**/*.{ts,vue}",
  "modules/**/*.{ts,vue}",
  "index.ts",
];

const sourceCoverageExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/storybook-static/**",
  "**/.yarn/**",
  "**/apps/**/dist/**",
  "**/*.d.ts",
  "**/*.stories.*",
  "**/*.{test,spec}.{js,ts,jsx,tsx,vue}",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/tests/**",
  "shell/_internal/_storybook-helpers.ts",
  "core/api/platform.ts",
];

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "json", "html"],
      include: sourceCoverageInclude,
      exclude: sourceCoverageExclude,
      thresholds: {
        statements: 72,
        lines: 72,
        functions: 55,
        branches: 74,
      },
    },
    setupFiles: [resolve(__dirname, "./vitest-mocks.setup.ts"), resolve(__dirname, "./vitest-axe.setup.ts")],
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.worktrees/**",
      "**/ui/__tests__/stories-snapshot.test.ts",
      "**/ui/__tests__/stories-visual.test.ts",
    ],
  },
  resolve: {
    alias: frameworkAliases,
  },
});
