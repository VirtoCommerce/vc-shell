import { defineConfig } from "vite";
import path from "path";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "api-client",
      formats: ["cjs"],
    },
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "./tsconfig.json"),
        }),
      ],
    },
  },
});
