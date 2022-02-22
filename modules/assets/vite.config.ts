import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "assets",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "@virtoshell/ui",
        "@virtoshell/core",
        "@virtoshell/api-client",
        "vue",
      ],
      output: {
        globals: {
          vue: "vue",
          "@virtoshell/ui": "@virtoshell/ui",
          "@virtoshell/core": "@virtoshell/core",
          "@virtoshell/api-client": "@virtoshell/api-client",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "assets.css";
          return assetInfo.name as string;
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
