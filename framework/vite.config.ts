import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import { LibraryOptions } from "vite";
import * as path from "path";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
      resolve: {
        alias: {
            '@api': path.resolve(__dirname, "./core/api"),
            '@components': path.resolve(__dirname, "./components"),
            "@composables": path.resolve(__dirname, "./core/composables"),
            "@directives":path.resolve(__dirname, "./core/directives"),
            "@plugins":path.resolve(__dirname, "./core/plugins"),
            "@types":path.resolve(__dirname, "./core/types"),
            "@utilities": path.resolve(__dirname, './core/utilities'),
            '@shared': path.resolve(__dirname, "./shared")
        }
      },
    build: {
      lib: {
        entry: "/index.ts",
      } as LibraryOptions,
      rollupOptions: {
        external: [
          "vue",
          "vue-router",
          "vee-validate",
          "@vc-shell/config-generator",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@vc-shell/config-generator": "@vc-shell/config-generator",
            "vue-router": "vue-router",
            "vee-validate": "vee-validate",
          },
        },
      },
    },
  },
  "shell"
);
