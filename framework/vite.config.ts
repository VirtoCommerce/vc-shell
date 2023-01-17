import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "path";
import VueMacros from "unplugin-vue-macros/vite";

export default getLibraryConfiguration(
  {
    plugins: [
      VueMacros({
        plugins: {
          vue: vue(),
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    build: {
      target: "esnext",
      lib: {
        entry: path.resolve(__dirname, "index.ts"),
      },
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
    optimizeDeps: {
      esbuildOptions: {
        target: ["es2020", "safari14"],
      },
    },
  },
  "shell"
);
