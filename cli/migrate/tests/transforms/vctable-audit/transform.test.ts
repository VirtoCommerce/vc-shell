import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/vctable-audit";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("vctable-audit (diagnostic)", () => {
  it("reports VcTable usage in .vue files", () => {
    const source = `<template>
  <VcBlade title="Test">
    <VcTable :columns="cols" :items="items" />
  </VcBlade>
</template>
<script setup lang="ts">
const cols = [];
const items = [];
</script>`;

    const { result, reports } = applyTransformWithReports(transform, {
      path: "src/modules/test/pages/list.vue",
      source,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("VcTable");
  });

  it("ignores files without VcTable", () => {
    const source = `<template>
  <VcBlade title="Test">
    <VcDataTable :items="items" />
  </VcBlade>
</template>`;

    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/test/pages/list.vue",
      source,
    });
    expect(reports).toHaveLength(0);
  });

  it("ignores non-vue files", () => {
    const source = `import { VcTable } from "@vc-shell/framework";`;
    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/test/composables/index.ts",
      source,
    });
    expect(reports).toHaveLength(0);
  });
});
