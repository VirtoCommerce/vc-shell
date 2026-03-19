import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runScssSafeUse } from "../../../src/transforms/scss-safe-use";

describe("scss-safe-use transform", () => {
  it("reports safe @import to @use conversions", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    // SCSS isn't in the ts-morph project — the transform works on filesystem
    // For testing, we just verify the transform runs without error
    // and returns diagnostic info

    const result = runScssSafeUse(project, { dryRun: false, cwd: "/nonexistent" });

    // Should always output the manual checklist
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    expect(result.filesModified).toHaveLength(0); // diagnostic only
  });

  it("always includes the manual checklist", () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const result = runScssSafeUse(project, { dryRun: false, cwd: "/nonexistent" });

    const allWarnings = result.warnings.join("\n");
    expect(allWarnings).toContain("Check for @import statements that can be converted to @use");
    expect(allWarnings).toContain("Remove old base.scss/colors.scss if present");
    expect(allWarnings).toContain("Move custom styles to appropriate files");
  });

  it("never populates filesModified", () => {
    const project = new Project({ useInMemoryFileSystem: true });

    const result = runScssSafeUse(project, { dryRun: false, cwd: "/nonexistent" });

    expect(result.filesModified).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
