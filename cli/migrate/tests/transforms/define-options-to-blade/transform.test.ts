import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/define-options-to-blade";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "__testfixtures__");

describe("define-options-to-blade", () => {
  it("replaces defineOptions with defineBlade for blade components", () => {
    const input = readFileSync(join(FIXTURES, "basic-blade.input.vue"), "utf8");
    const result = applyTransform(transform, { path: "test.vue", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("defineBlade(");
    expect(result).not.toContain("defineOptions(");
    expect(result).toContain('name: "Entities"');
    expect(result).toContain('url: "/entities"');
  });

  it("removes notifyType property", () => {
    const input = readFileSync(join(FIXTURES, "with-notify-type.input.vue"), "utf8");
    const result = applyTransform(transform, { path: "test.vue", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("defineBlade(");
    expect(result).not.toContain("notifyType");
    expect(result).toContain('name: "Entity"');
    expect(result).toContain('url: "/entity"');
  });

  it("skips defineOptions without blade fields", () => {
    const input = readFileSync(join(FIXTURES, "no-blade-fields.input.vue"), "utf8");
    const result = applyTransform(transform, { path: "test.vue", source: input });
    expect(result).toBeNull();
  });

  it("skips non-vue files", () => {
    const input = `defineOptions({ name: "Test", url: "/test" });`;
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).toBeNull();
  });

  it("skips notification component defineOptions (has notifyType but no blade fields)", () => {
    const input = `<template><div>{{ notification.title }}</div></template>
<script setup lang="ts">
defineOptions({
  name: "EntityCreatedDomainEvent",
  inheritAttrs: false,
  notifyType: "EntityCreatedDomainEvent",
});
</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: input });
    expect(result).toBeNull();
  });
});
