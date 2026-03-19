import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runUseBladeMigration } from "../../../src/transforms/use-blade-migration";

describe("use-blade-migration transform", () => {
  it("renames useBladeNavigation import and call to useBlade", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useBladeNavigation } from "@vc-shell/framework";
const { openBlade, closeBlade } = useBladeNavigation();`,
    );

    const result = runUseBladeMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("useBlade");
    expect(text).not.toMatch(/\buseBladeNavigation\b/);
    expect(result.filesModified).toHaveLength(1);
  });

  it("inverts simple onBeforeClose return false → return !false", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return false;
});`,
    );

    runUseBladeMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("useBlade");
    // The return value should be inverted
    expect(text).toContain("!false");
  });

  it("inverts return true → return !true", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return true;
});`,
    );

    runUseBladeMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("!true");
  });

  it("inverts return expression → return !(expression)", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return isDirty.value;
});`,
    );

    runUseBladeMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("!(isDirty.value)");
  });

  it("warns on complex callbacks with multiple returns", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile(
      "test.ts",
      `import { useBladeNavigation } from "@vc-shell/framework";
const { onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  if (condition) return false;
  return true;
});`,
    );

    const result = runUseBladeMigration(project, { dryRun: false, cwd: "." });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("manual review");
  });

  it("skips files without useBladeNavigation", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `import { ref } from "vue";`);

    const result = runUseBladeMigration(project, { dryRun: false, cwd: "." });
    expect(result.filesModified).toHaveLength(0);
  });
});
