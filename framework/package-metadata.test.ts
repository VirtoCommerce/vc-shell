import { describe, it, expect } from "vitest";
import pkg from "./package.json";

describe("package.json metadata", () => {
  // FR-1.4: exports map must not contain ./* wildcard
  it("exports map does not contain ./* wildcard entry", () => {
    expect(Object.keys(pkg.exports)).not.toContain("./*");
  });

  // FR-1.1: exports map has only explicit named entries
  it("exports map contains only expected explicit entries", () => {
    const keys = Object.keys(pkg.exports);
    const allowed = [
      ".",
      "./ui",
      "./ai-agent",
      "./extensions",
      "./globals",
      "./package.json",
      "./dist/index.css",
      "./locales/en",
      "./locales/de",
      "./locales/types",
      "./tailwind.config",
    ];
    for (const key of keys) {
      expect(allowed).toContain(key);
    }
  });

  // FR-1.5: files array must not contain source directories
  it("files array does not contain ui source directory", () => {
    expect(pkg.files).not.toContain("ui");
  });

  it("files array does not contain core source directory", () => {
    expect(pkg.files).not.toContain("core");
  });

  it("files array does not contain shared source directory", () => {
    expect(pkg.files).not.toContain("shared");
  });

  // FR-1.6 + NFR-2: sideEffects must not contain index.ts
  it("sideEffects does not contain index.ts", () => {
    expect(pkg.sideEffects).not.toContain("index.ts");
  });

  // NFR-2: sideEffects contains only CSS/SCSS/Vue entries
  it("sideEffects contains only CSS, SCSS, and Vue entries", () => {
    for (const entry of pkg.sideEffects) {
      expect(entry).toMatch(/\.(css|scss|vue)$/);
    }
  });

  // FR-4.1: shared runtime deps must be in peerDependencies
  it("peerDependencies contains vue", () => {
    expect(pkg).toHaveProperty("peerDependencies.vue");
  });

  it("peerDependencies contains vue-router", () => {
    expect(pkg).toHaveProperty("peerDependencies.vue-router");
  });

  it("dependencies contains vue-i18n", () => {
    expect(pkg).toHaveProperty("dependencies.vue-i18n");
  });

  it("dependencies contains vee-validate", () => {
    expect(pkg).toHaveProperty("dependencies.vee-validate");
  });

  it("dependencies contains @vueuse/core", () => {
    expect(pkg).toHaveProperty("dependencies.@vueuse/core");
  });

  it("dependencies contains @vueuse/components", () => {
    expect(pkg).toHaveProperty("dependencies.@vueuse/components");
  });

  it("dependencies contains @vueuse/integrations", () => {
    expect(pkg).toHaveProperty("dependencies.@vueuse/integrations");
  });

  // FR-4.1: shared runtime deps must NOT remain in dependencies
  it("dependencies does not contain vue", () => {
    expect(pkg.dependencies).not.toHaveProperty("vue");
  });

  it("dependencies does not contain vue-router", () => {
    expect(pkg.dependencies).not.toHaveProperty("vue-router");
  });

  it("peerDependencies does not contain vue-i18n", () => {
    expect(pkg.peerDependencies).not.toHaveProperty("vue-i18n");
  });

  it("peerDependencies does not contain vee-validate", () => {
    expect(pkg.peerDependencies).not.toHaveProperty("vee-validate");
  });

  it("peerDependencies does not contain @vueuse/core", () => {
    expect(pkg.peerDependencies).not.toHaveProperty("@vueuse/core");
  });

  it("peerDependencies does not contain @vueuse/components", () => {
    expect(pkg.peerDependencies).not.toHaveProperty("@vueuse/components");
  });

  it("peerDependencies does not contain @vueuse/integrations", () => {
    expect(pkg.peerDependencies).not.toHaveProperty("@vueuse/integrations");
  });

  // peerDependenciesMeta: required peers marked optional: false
  it("peerDependenciesMeta marks vue as optional: false", () => {
    expect(pkg).toHaveProperty("peerDependenciesMeta.vue.optional", false);
  });

  it("peerDependenciesMeta marks vue-router as optional: false", () => {
    expect(pkg).toHaveProperty("peerDependenciesMeta.vue-router.optional", false);
  });

  // peerDependenciesMeta should not contain entries for packages moved to dependencies
  it("peerDependenciesMeta does not contain vue-i18n", () => {
    expect(pkg.peerDependenciesMeta).not.toHaveProperty("vue-i18n");
  });

  it("peerDependenciesMeta does not contain vee-validate", () => {
    expect(pkg.peerDependenciesMeta).not.toHaveProperty("vee-validate");
  });

  it("peerDependenciesMeta does not contain @vueuse/core", () => {
    expect(pkg.peerDependenciesMeta).not.toHaveProperty("@vueuse/core");
  });

  it("peerDependenciesMeta does not contain @vueuse/components", () => {
    expect(pkg.peerDependenciesMeta).not.toHaveProperty("@vueuse/components");
  });

  it("peerDependenciesMeta does not contain @vueuse/integrations", () => {
    expect(pkg.peerDependenciesMeta).not.toHaveProperty("@vueuse/integrations");
  });
});
