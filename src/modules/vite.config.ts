import path, { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default {
  build: {
    lib: {
      entry: resolve(__dirname, "./index.ts"),
      fileName: (format, name) => `${name}.mjs`,
      formats: ["es"],
    },
    outDir: path.join(__dirname, "dist"),
    rollupOptions: {
      external: [
        /node_modules/,
        "@vc-shell/framework",
        "vue",
        "vue-router",
        "vcmp-vendor-portal-api/marketplacevendor",
        "vcmp-vendor-portal-api/orders",
        "vcmp-vendor-portal-api/catalog",
        "vee-validate",
        "vue-i18n",
        "moment",
        "lodash-es",
        "@vueuse/core",
      ],
    },
  },
  plugins: [vue()],
};