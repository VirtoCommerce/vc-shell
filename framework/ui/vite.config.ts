import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@virtoshell/config-generator";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: ["@virtoshell/core", "vue", "vue-router", "vee-validate"],
        output: {
          globals: {
            vue: "Vue",
            "vue-router": "vue-router",
            "@virtoshell/core": "@virtoshell/core",
            "vee-validate": "vee-validate",
          },
        },
      },
    },
  },
  "ui"
);
