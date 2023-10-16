import { LibraryOptions, UserConfig } from "vite";

export default {
  build: {
    lib: {
      entry: process.cwd() + "/src/index.ts",
      formats: ["es"],
    } as LibraryOptions,
  },
} as UserConfig;
