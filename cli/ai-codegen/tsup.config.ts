import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
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
  ],
  noExternal: [],
});

