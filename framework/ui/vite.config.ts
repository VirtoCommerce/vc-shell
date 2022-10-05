import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@virto-shell/config-generator";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@virto-shell/core",
          "@virto-shell/api-client",
          "vue",
          "vue-router",
        ],
        output: {
          globals: {
            vue: "Vue",
            "vue-router": "vue-router",
            "@virto-shell/core": "@virto-shell/core",
            "@virto-shell/api-client": "@virto-shell/api-client",
          },
        },
      },
    },
  },
  "ui"
);
