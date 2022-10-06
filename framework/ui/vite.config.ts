import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@vc-shell/core",
          "@vc-shell/api-client",
            "@vc-shell/config-generator",
          "vue",
          "vue-router",
          "vee-validate",
        ],
        output: {
          globals: {
            vue: "Vue",
            "vue-router": "vue-router",
            "@vc-shell/core": "@vc-shell/core",
            "@vc-shell/api-client": "@vc-shell/api-client",
              "@vc-shell/config-generator": "@vc-shell/config-generator",
            "vee-validate": "vee-validate",
          },
        },
      },
    },
  },
  "ui"
);
