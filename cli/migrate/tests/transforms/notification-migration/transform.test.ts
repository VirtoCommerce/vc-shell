// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/notification-migration";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("notification-migration (jscodeshift)", () => {
  it("renames useNotifications to useBladeNotifications", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useNotifications } from "@vc-shell/framework";\nconst { notifications } = useNotifications();`,
    });
    expect(result).toContain("useBladeNotifications");
    expect(result).not.toContain("useNotifications");
  });

  it("skips files without @vc-shell/framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("skips files without useNotifications import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "@vc-shell/framework";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("handles Vue SFC files", () => {
    const vue = `<template><div/></template>
<script setup lang="ts">
import { useNotifications } from "@vc-shell/framework";
const { notifications } = useNotifications();
</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain("<template><div/></template>");
    expect(result).toContain("useBladeNotifications");
    expect(result).not.toContain("useNotifications");
  });
});
