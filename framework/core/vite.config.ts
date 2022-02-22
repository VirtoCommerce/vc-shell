import path from "path";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "core",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["@virtoshell/api-client", "vue", "vue-router"],
      output: {
        globals: {
          vue: "vue",
          "vue-router": "vue-router",
          "@virtoshell/api-client": "@virtoshell/api-client",
        },
      },
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
        }),
      ],
    },
  },
});
