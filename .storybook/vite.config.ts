import { URL, fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const app = async () => {
  return defineConfig({
    plugins: [vue()],
    assetsInclude: ["/sb-preview/runtime.js"],
    resolve: {
      alias: {
        "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
        "@vc-shell/framework": "@vc-shell/framework/index.ts",
      },
    },
  });
};

export default app;
