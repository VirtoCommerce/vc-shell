import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@virtoshell/config-generator";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: [
          "@virtoshell/core",
          "@virtoshell/api-client",
          "vue",
          "vue-router",
        ],
        output: {
          globals: {
            vue: "Vue",
            "vue-router": "vue-router",
            "@virtoshell/core": "@virtoshell/core",
            "@virtoshell/api-client": "@virtoshell/api-client",
          },
        },
      },
    },
  },
  "ui"
);
