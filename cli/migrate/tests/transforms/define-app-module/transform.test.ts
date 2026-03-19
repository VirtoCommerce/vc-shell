import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runDefineAppModule } from "../../../src/transforms/define-app-module";

describe("define-app-module transform", () => {
  it("transforms createAppModule to defineAppModule", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { createAppModule } from "@vc-shell/framework";
export default createAppModule(pages, locales);`,
    );

    const result = runDefineAppModule(project, {
      dryRun: false,
      cwd: ".",
    });

    expect(source.getFullText()).toContain("defineAppModule");
    expect(source.getFullText()).toContain(
      "defineAppModule({ pages, locales })",
    );
    expect(source.getFullText()).not.toContain("createAppModule");
    expect(result.filesModified).toHaveLength(1);
  });

  it("skips files without createAppModule", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `import { ref } from "vue";`);

    const result = runDefineAppModule(project, {
      dryRun: false,
      cwd: ".",
    });
    expect(result.filesModified).toHaveLength(0);
  });

  it("handles createAppModule with additional arguments", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { createAppModule } from "@vc-shell/framework";
export default createAppModule(pages, locales, { name: "MyModule" });`,
    );

    const result = runDefineAppModule(project, {
      dryRun: false,
      cwd: ".",
    });

    // Should warn about non-standard arguments
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
