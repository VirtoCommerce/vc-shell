// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/banner-variants";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("banner-variants (jscodeshift)", () => {
  it("renames light-danger to danger", () => {
    const vue = `<template>\n<VcBanner variant="light-danger" />\n</template>\n<script setup lang="ts">\nconst x = 1;\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain('variant="danger"');
    expect(result).not.toContain("light-danger");
  });

  it("renames info-dark and primary to info", () => {
    const vue = `<template>\n<VcBanner variant="info-dark" />\n<VcBanner variant="primary" />\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).not.toContain("info-dark");
    expect(result).not.toContain('variant="primary"');
    // Both should become variant="info"
    const matches = result!.match(/variant="info"/g);
    expect(matches).toHaveLength(2);
  });

  it("returns null for .ts files", () => {
    const result = applyTransform(transform, { path: "test.ts", source: "const x = 1;" });
    expect(result).toBeNull();
  });

  it("returns null when no VcBanner present", () => {
    const vue = `<template>\n<div>hello</div>\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toBeNull();
  });
});
