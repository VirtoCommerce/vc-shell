import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/widgets-migration";
import { applyTransform, applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("widgets-migration (jscodeshift)", () => {
  it("renames useWidgets to useBladeWidgets", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";\nconst { widgets } = useWidgets();`,
    });
    expect(result).toContain("useBladeWidgets");
    expect(result).not.toContain("useWidgets");
  });

  it("skips files without @vc-shell/framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("emits warning when registerWidget is present", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";
const { registerWidget } = useWidgets();
registerWidget("MyWidget", MyComponent);`,
    });
    expect(result).not.toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("registerWidget/unregisterWidget calls require manual review");
  });

  it("emits warning when unregisterWidget is present", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";
const { unregisterWidget } = useWidgets();
unregisterWidget("MyWidget");`,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("manual review");
  });

  it("does not emit warning without registerWidget/unregisterWidget", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useWidgets } from "@vc-shell/framework";\nconst { widgets } = useWidgets();`,
    });
    expect(reports).toHaveLength(0);
  });
});
