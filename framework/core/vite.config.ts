import { getLibraryConfiguration } from "@virtoshell/config-generator";
import vue from "@vitejs/plugin-vue";

export default getLibraryConfiguration(
  {
    plugins: [vue()],
    build: {
      rollupOptions: {
        external: ["@virtoshell/api-client", "vue"],
        output: {
          globals: {
            vue: "Vue",
            "@virtoshell/api-client": "@virtoshell/api-client",
          },
        },
      },
    },
  },
  "core"
);
