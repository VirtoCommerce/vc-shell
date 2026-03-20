import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/menu-group-config";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("menu-group-config (jscodeshift)", () => {
  it("reports deprecated groupIcon usage", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const menu = { groupIcon: "fas fa-cog" };`,
    });
    expect(result).toBeNull();
    expect(reports[0]).toContain("groupIcon");
  });

  it("reports deprecated group string pattern", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const menu = { group: "settings" };`,
    });
    expect(reports[0]).toContain("group (string)");
  });

  it("returns no reports for clean files", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const menu = { groupConfig: { id: "settings" } };`,
    });
    expect(reports).toHaveLength(0);
  });
});
