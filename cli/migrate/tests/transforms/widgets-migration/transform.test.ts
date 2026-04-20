import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/widgets-migration";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("widgets-migration (jscodeshift)", () => {
  it("emits diagnostic for useWidgets usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";\nconst { registerWidget } = useWidgets();`,
    });
    // Diagnostic-only: no modification
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("useBladeWidgets");
    expect(reports[0]).toContain("Manual rewrite required");
  });

  it("skips files without @vc-shell/framework import", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });

  it("skips files without useWidgets import", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst { param } = useBlade();`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });

  it("emits diagnostic with API change details", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";
const { widgets } = useWidgets();`,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("API completely changed");
    expect(reports.join("\n")).toContain("updateActiveWidget()");
    expect(reports.join("\n")).toContain("refreshAll()");
  });

  it("emits diagnostic for .vue files via SFC wrapper", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.vue",
      source: `<template><div/></template>
<script setup lang="ts">
import { useWidgets } from "@vc-shell/framework";
const { registerWidget } = useWidgets();
</script>`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
  });
});
