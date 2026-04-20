import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/icon-replace";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("icon-replace", () => {
  it("replaces material icons with lucide equivalents", () => {
    const source = `const toolbar = [{ icon: "material-delete", title: "Delete" }, { icon: "material-add", title: "Add" }];`;
    const { result, reports } = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result).toContain('"lucide-trash-2"');
    expect(result).toContain('"lucide-plus"');
    expect(result).not.toContain("material-");
    expect(reports).toHaveLength(1);
  });

  it("replaces FA class syntax", () => {
    const source = `const icon = "fas fa-check";`;
    const { result } = applyTransformWithReports(transform, { path: "test.ts", source });
    expect(result).toContain('"lucide-check"');
    expect(result).not.toContain("fas");
  });

  it("replaces bootstrap icons", () => {
    const source = `<VcIcon icon="bi-trash" />`;
    const { result } = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result).toContain('"lucide-trash-2"');
  });

  it("preserves single quotes", () => {
    const source = `icon: 'material-save'`;
    const { result } = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result).toContain("'lucide-save'");
  });

  it("does nothing for lucide icons", () => {
    const source = `const icon = "lucide-check";`;
    const { result } = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result).toBeNull();
  });

  it("does nothing for unknown icons", () => {
    const source = `const icon = "material-unknown_custom_icon";`;
    const { result } = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result).toBeNull();
  });
});
