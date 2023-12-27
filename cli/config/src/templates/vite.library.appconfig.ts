import { LibraryOptions, defineConfig } from "vite";
import { cwd } from "node:process";

export default defineConfig({
  build: {
    lib: {
      entry: cwd() + "/src/index.ts",
      formats: ["es"],
    } as LibraryOptions,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
});
