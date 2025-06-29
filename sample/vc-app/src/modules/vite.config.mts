import path, { resolve, dirname } from "node:path";
import vue from "@vitejs/plugin-vue";
import libAssetsPlugin from "@laynezh/vite-plugin-lib-assets";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "/assets/empty.png": path.resolve(__dirname, "../../public/assets/empty.png"),
    },
  },
  build: {
    copyPublicDir: false,
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
        "@vc-app/api",
        "vue-i18n",
        "moment",
        "lodash-es",
        "@vueuse/core",
        "vee-validate",
      ],
    },
  },
  plugins: [libAssetsPlugin(), vue()],
});
