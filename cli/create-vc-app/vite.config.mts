import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        // Node.js built-in modules
        /^node:.*/,
        "fs",
        "path",
        "process",
        "url",
        "stream",
        "util",
        "events",
        "buffer",
        "os",
        "crypto",
        "http",
        "https",
        "zlib",
        "child_process",
      ],
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
