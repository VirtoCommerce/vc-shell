import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@virtoshell/config-generator";
import { PreRenderedAsset } from "rollup";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@virtoshell/ui",
          "@virtoshell/core",
          "@virtoshell/api-client",
          "@virtoshell/config-generator",
          "vue",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@virtoshell/ui": "@virtoshell/ui",
            "@virtoshell/core": "@virtoshell/core",
            "@virtoshell/api-client": "@virtoshell/api-client",
            "@virtoshell/config-generator": "@virtoshell/config-generator",
          },
        },
      },
    },
  },
  "assets"
);
