import { URL, fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import path from "path";

const app = async () => {
  return defineConfig({
    plugins: [
      vue(),
      {
        // Кастомный плагин для предоставления глобальных переменных
        name: 'provide-jquery',
        transformIndexHtml() {
          return [
            {
              tag: 'script',
              attrs: { src: 'https://code.jquery.com/jquery-3.7.1.min.js' },
              injectTo: 'head'
            }
          ]
        }
      }
    ],
    assetsInclude: ["/sb-preview/runtime.js"],
    resolve: {
      alias: {
        "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
        "@vc-shell/framework": "@vc-shell/framework/index.ts",
        "@": path.resolve(__dirname, "../"),
        "framework": path.resolve(__dirname, "../framework"),
        "~/": path.resolve(__dirname, "../"),
        // Добавляем алиас для jQuery
        'jquery': path.resolve(__dirname, '../node_modules/jquery/dist/jquery.js'),
      },
      dedupe: ['vue', 'vue-router', 'vue-i18n', 'jquery']
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'vue-i18n', '@vueuse/core', 'lodash-es', 'jquery']
    },
    define: {
      // Делаем jQuery доступным глобально как $
      global: {},
    },
  });
};

export default app;
