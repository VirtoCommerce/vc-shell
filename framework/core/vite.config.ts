import { getLibraryConfiguration } from "@vc-shell/config-generator";
import vue from "@vitejs/plugin-vue";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@vc-shell/api-client",
          "vue",
          "@vc-shell/config-generator",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@vc-shell/api-client": "@vc-shell/api-client",
            "@vc-shell/config-generator": "@vc-shell/config-generator",
          },
        },
      },
    },
  },
  "core"
);
