import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"], // pure ESM package
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
