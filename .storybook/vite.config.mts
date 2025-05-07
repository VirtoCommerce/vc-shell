import { URL, fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import path from "path";

const app = async () => {
  return defineConfig({
    plugins: [
      vue(),
    ],
    assetsInclude: ["/sb-preview/runtime.js"],
    resolve: {
      alias: {
        "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
        "@vc-shell/framework": "@vc-shell/framework/index.ts",
        "@": path.resolve(__dirname, "../"),
        "framework": path.resolve(__dirname, "../framework"),
        "~/": path.resolve(__dirname, "../"),
      },
      dedupe: ['vue', 'vue-router', 'vue-i18n']
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'vue-i18n', '@vueuse/core', 'lodash-es']
    },
  });
};

export default app;
