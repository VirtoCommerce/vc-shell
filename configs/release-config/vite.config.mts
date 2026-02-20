import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const releaseConfigSrc = resolve(__dirname, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@release-config": releaseConfigSrc,
    },
  },
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
