import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/icon-container-prop";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("icon-container-prop (jscodeshift)", () => {
  it("removes useContainer from VcIcon", () => {
    const vue = `<template>\n<VcIcon icon="check" :useContainer="true" />\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).not.toContain("useContainer");
    expect(result).toContain('icon="check"');
  });

  it("removes use-container from vc-icon", () => {
    const vue = `<template>\n<vc-icon icon="check" :use-container="true" />\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).not.toContain("use-container");
  });

  it("returns null when no VcIcon present", () => {
    const vue = `<template>\n<div>hello</div>\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toBeNull();
  });
});
