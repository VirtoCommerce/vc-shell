import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/icon-audit";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("icon-audit (jscodeshift)", () => {
  it("reports FA icons found in source", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const icon = "fas fa-check";`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("fa-check");
  });

  it("returns no reports for clean files", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const icon = "mdi-check";`,
    });
    expect(reports).toHaveLength(0);
  });
});
