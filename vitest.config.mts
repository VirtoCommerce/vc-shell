import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import { default as viteConfig } from "./vite.config.mjs";

export default defineConfig((env) =>
  mergeConfig(
    viteConfig,
    defineConfig({
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "test/setup.ts",
      },
    }),
  ),
);
