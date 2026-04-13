import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/replace-cover-method";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("replace-cover-method (diagnostic)", () => {
  it("emits diagnostic for replaceWith usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst { replaceWith } = useBlade();\nreplaceWith({ name: "Details" });`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("replaceWith");
    expect(reports[0]).toContain("coverWith");
  });

  it("skips files without replaceWith", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `import { useBlade } from "@vc-shell/framework";\nconst { openBlade } = useBlade();`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });

  it("skips files without framework import", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const x = 1;`,
    });
    expect(result).toBeNull();
    expect(reports).toHaveLength(0);
  });
});
