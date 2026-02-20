import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiClientSrc = resolve(__dirname, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@api-client-generator": apiClientSrc,
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), /^node:.*/],
    },
    target: "esnext",
  },
  plugins: [
    dts({
      tsconfigPath: "./src/tsconfig.json",
    }),
  ],
});
