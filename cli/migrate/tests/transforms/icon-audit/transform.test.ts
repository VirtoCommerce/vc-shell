// @vitest-environment node
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
    expect(reports[0]).toContain("Font Awesome");
  });

  it("reports material icons found in source", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.vue",
      source: `const toolbar = [{ icon: "material-delete", title: "Delete" }];`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("material-delete");
    expect(reports[0]).toContain("Material");
  });

  it("reports bootstrap icons found in source", () => {
    const { result, reports } = applyTransformWithReports(transform, {
      path: "test.vue",
      source: `<VcIcon icon="bi-trash" />`,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("bi-trash");
    expect(reports[0]).toContain("Bootstrap");
  });

  it("reports multiple icon packs in one file", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.vue",
      source: `
        const a = "material-add";
        const b = "material-delete";
        const c = "bi-pencil";
      `,
    });
    expect(reports).toHaveLength(3);
  });

  it("returns no reports for lucide icons", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const icon = "lucide-check";`,
    });
    expect(reports).toHaveLength(0);
  });

  it("returns no reports for clean files", () => {
    const { reports } = applyTransformWithReports(transform, {
      path: "test.ts",
      source: `const icon = "mdi-check";`,
    });
    expect(reports).toHaveLength(0);
  });
});
