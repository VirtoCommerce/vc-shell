import typescript from "@rollup/plugin-typescript";
import { LibraryOptions } from "vite";

export default {
  build: {
    sourcemap: true,
    lib: {
      entry: process.cwd() + "/src/index.ts",
      formats: ["cjs"],
    } as LibraryOptions,
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: process.cwd() + "/tsconfig.json",
        }),
      ],
    },
  },
};
