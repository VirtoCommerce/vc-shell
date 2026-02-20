import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const createVcAppSrc = resolve(__dirname, "src");
const createVcAppPackageJson = resolve(__dirname, "package.json");

export default defineConfig({
  resolve: {
    alias: {
      "@create-vc-app/package.json": createVcAppPackageJson,
      "@create-vc-app": createVcAppSrc,
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), /^node:.*/],
      output: {
        banner: "#!/usr/bin/env node",
      },
    },
    target: "esnext",
  },
  plugins: [
    dts({
      tsconfigPath: "./src/tsconfig.json",
    }),
  ],
});
