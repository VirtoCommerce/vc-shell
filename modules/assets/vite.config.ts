import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@vc-shell/framework",
          "@vc-shell/config-generator",
          "vue",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@vc-shell/framework": "@vc-shell/framework",
            "@vc-shell/config-generator": "@vc-shell/config-generator",
          },
        },
      },
    },
  },
  "assets"
);
