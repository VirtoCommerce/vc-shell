import typescript from "@rollup/plugin-typescript";
import { LibraryOptions, UserConfigExport } from "vite";
import { RollupOptions } from "rollup";

export default {
  build: {
    // sourcemap: true,
    lib: {
      entry: process.cwd() + "/src/index.ts",
      formats: ["cjs", "esm"],
    } as LibraryOptions,
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: process.cwd() + "/tsconfig.json",
        }),
      ],
    } as RollupOptions,
  },
} as UserConfigExport;
