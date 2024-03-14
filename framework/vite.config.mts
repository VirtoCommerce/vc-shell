import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "path";
import { checker } from "vite-plugin-checker";
import { resolve } from "node:path";

const mode = process.env.APP_ENV as string;

export default getLibraryConfiguration({
  resolve: {
    alias: {
      "@vc-shell/tailwind-config": resolve("./../configs/tailwind-config"),
    },
  },
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
  ],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: mode === "development",
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "vue-router", "vee-validate", "@vc-shell/config-generator"],
    },
  },
  envPrefix: "APP_",
});
