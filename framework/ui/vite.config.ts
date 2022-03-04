import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "ui",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "@virtoshell/core",
        "@virtoshell/api-client",
        "vue",
        "vue-router",
      ],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "vue-router",
          "@virtoshell/core": "@virtoshell/core",
          "@virtoshell/api-client": "@virtoshell/api-client",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "ui.css";
          return assetInfo.name as string;
        },
      },
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "tsconfig.json"),
        }),
      ],
    },
  },
});
