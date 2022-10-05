import { getLibraryConfiguration } from "@virto-shell/config-generator";
import vue from "@vitejs/plugin-vue";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: ["@virto-shell/api-client", "vue"],
        output: {
          globals: {
            vue: "Vue",
            "@virto-shell/api-client": "@virto-shell/api-client",
          },
        },
      },
    },
  },
  "core"
);
