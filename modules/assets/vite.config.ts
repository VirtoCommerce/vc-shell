import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@virto-shell/config-generator";
import { PreRenderedAsset } from "rollup";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@virto-shell/ui",
          "@virto-shell/core",
          "@virto-shell/api-client",
          "vue",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@virto-shell/ui": "@virto-shell/ui",
            "@virto-shell/core": "@virto-shell/core",
            "@virto-shell/api-client": "@virto-shell/api-client",
          },
        },
      },
    },
  },
  "assets"
);
