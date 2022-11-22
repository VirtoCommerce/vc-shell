import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import { LibraryOptions } from "vite";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
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
