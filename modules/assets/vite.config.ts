import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import { PreRenderedAsset } from "rollup";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@vc-shell/ui",
          "@vc-shell/core",
          "@vc-shell/api-client",
          "@vc-shell/config-generator",
          "vue",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@vc-shell/ui": "@vc-shell/ui",
            "@vc-shell/core": "@vc-shell/core",
            "@vc-shell/api-client": "@vc-shell/api-client",
            "@vc-shell/config-generator": "@vc-shell/config-generator",
          },
        },
      },
    },
  },
  "assets"
);
