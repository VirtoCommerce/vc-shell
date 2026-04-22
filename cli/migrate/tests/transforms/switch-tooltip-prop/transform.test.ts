// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/switch-tooltip-prop";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("switch-tooltip-prop (jscodeshift)", () => {
  it("renames tooltip to hint", () => {
    const vue = `<template>\n<VcSwitch tooltip="Help text" />\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain('hint="Help text"');
    expect(result).not.toContain("tooltip=");
  });

  it("renames :tooltip to :hint", () => {
    const vue = `<template>\n<VcSwitch :tooltip="tooltipText" />\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain(':hint="tooltipText"');
  });

  it("returns null when no VcSwitch present", () => {
    const vue = `<template>\n<div>hello</div>\n</template>\n<script setup lang="ts">\n</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toBeNull();
  });
});
