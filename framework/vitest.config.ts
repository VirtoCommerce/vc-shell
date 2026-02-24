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
  "@shared": `${frameworkRoot}/shared`,
  "@shared/": `${frameworkRoot}/shared/`,
  "@assets": `${frameworkRoot}/assets`,
  "@assets/": `${frameworkRoot}/assets/`,
  "@locales": `${frameworkRoot}/locales`,
  "@locales/": `${frameworkRoot}/locales/`,
  "@vc-shell/framework/": `${frameworkRoot}/`,
  "@vc-shell/framework": resolve(__dirname, "./index.ts"),
};

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 30,
        functions: 25,
        branches: 50,
      },
    },
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
  resolve: {
    alias: frameworkAliases,
  },
});
