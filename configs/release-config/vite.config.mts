import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "release-config": "./src/index.ts",
        "cli-generate-changelogs": "./src/cli-generate-changelogs.ts",
      },
      formats: ["es"], // pure ESM package
    },
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), /^node:.*/],
      output: {
        preserveModules: false,
      },
    },
    target: "esnext",
  },
  plugins: [
    dts({
      tsconfigPath: "./tsconfig.json",
    }),
  ],
});
