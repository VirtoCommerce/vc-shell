import typescript from "@rollup/plugin-typescript";
import { LibraryOptions, UserConfigExport } from "vite";
import { RollupOptions } from "rollup";

export default {
  build: {
    lib: {
      entry: process.cwd() + "/src/index.ts",
      formats: ["es"],
    } as LibraryOptions,
  },
} as UserConfigExport;
