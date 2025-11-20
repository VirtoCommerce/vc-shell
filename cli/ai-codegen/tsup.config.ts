import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lib.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
  external: [
    "typescript",
    "@babel/parser",
    "@babel/traverse",
    "@babel/generator",
    "@babel/types",
    "@vue/compiler-sfc",
    "fs-extra",
    "js-yaml",
  ],
  noExternal: [],
});

