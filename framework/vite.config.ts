import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "path";
import VueMacros from "unplugin-vue-macros";
import checker from "vite-plugin-checker";

export default getLibraryConfiguration({
  plugins: [
    VueMacros.vite({
      plugins: {
        vue: vue(),
      },
    }),
    checker({
      vueTsc: true,
    }),
  ],
  build: {
    target: "esnext",
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
    },
    rollupOptions: {
      external: [
        "vue",
        "vue-router",
        "vee-validate",
        "@vc-shell/config-generator",
      ],
      output: {
        globals: {
          vue: "Vue",
          "@vc-shell/config-generator": "@vc-shell/config-generator",
          "vue-router": "vue-router",
          "vee-validate": "vee-validate",
        },
      },
    },
  },
  envPrefix: "APP_",
  define: {
    "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL}"`,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: ["es2020", "safari14"],
    },
  },
});
