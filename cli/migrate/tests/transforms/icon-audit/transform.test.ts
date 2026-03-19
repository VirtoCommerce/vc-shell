import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runIconAudit } from "../../../src/transforms/icon-audit";

describe("icon-audit transform", () => {
  it("detects Font Awesome icons in string literals", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile(
      "test.ts",
      `const icon1 = "fas fa-check";
const icon2 = "fas fa-times";
const icon3 = "far fa-trash-alt";
const icon4 = "fas fa-check";  // duplicate
`,
    );

    const result = runIconAudit(project, { dryRun: false, cwd: "." });

    // Should report icons found (in warnings, since it's diagnostic)
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.filesModified).toHaveLength(0); // diagnostic only

    // Should mention found icons
    const allWarnings = result.warnings.join("\n");
    expect(allWarnings).toContain("fa-check");
    expect(allWarnings).toContain("fa-times");
    expect(allWarnings).toContain("fa-trash-alt");
  });

  it("reports nothing for files without FA icons", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `const x = "hello world";`);

    const result = runIconAudit(project, { dryRun: false, cwd: "." });
    // No icons found — no warnings about icons
    const iconWarnings = result.warnings.filter((w) => w.includes("fa-"));
    expect(iconWarnings).toHaveLength(0);
  });

  it("counts occurrences correctly across multiple files", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("a.ts", `const x = "fas fa-check";`);
    project.createSourceFile("b.ts", `const y = "fas fa-check"; const z = "far fa-user";`);

    const result = runIconAudit(project, { dryRun: false, cwd: "." });

    const allWarnings = result.warnings.join("\n");
    // fa-check appears in both files → 2 occurrences
    expect(allWarnings).toContain("fa-check");
    expect(allWarnings).toContain("2 occurrence");
    expect(allWarnings).toContain("fa-user");
  });

  it("includes Material Symbols suggestions for known icons", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `const icon = "fas fa-trash-alt";`);

    const result = runIconAudit(project, { dryRun: false, cwd: "." });

    const allWarnings = result.warnings.join("\n");
    expect(allWarnings).toContain("delete (Material Symbols)");
  });

  it("never populates filesModified regardless of icons found", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile(
      "test.ts",
      `const icon = "fas fa-cog"; const icon2 = "far fa-user";`,
    );

    const result = runIconAudit(project, { dryRun: false, cwd: "." });

    expect(result.filesModified).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
