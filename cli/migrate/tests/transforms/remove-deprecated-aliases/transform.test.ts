import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runRemoveDeprecatedAliases } from "../../../src/transforms/remove-deprecated-aliases";

describe("remove-deprecated-aliases transform", () => {
  it("renames deprecated imports and all usages", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { BladeInstance, TOOLBAR_SERVICE } from "@vc-shell/framework";
const blade: BladeInstance = inject(BladeInstance);
const toolbar = inject(TOOLBAR_SERVICE);`,
    );

    const result = runRemoveDeprecatedAliases(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("BladeInstanceKey");
    expect(text).toContain("ToolbarServiceKey");
    expect(text).not.toMatch(/\bBladeInstance\b(?!Key)/);
    expect(text).not.toContain("TOOLBAR_SERVICE");
    expect(result.filesModified).toHaveLength(1);
  });

  it("skips files without deprecated aliases", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `import { ref } from "vue";`);

    const result = runRemoveDeprecatedAliases(project, { dryRun: false, cwd: "." });
    expect(result.filesModified).toHaveLength(0);
  });

  it("renames all six deprecated aliases", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { navigationViewLocation, BladeInstance, NotificationTemplatesSymbol, BLADE_BACK_BUTTON, TOOLBAR_SERVICE, EMBEDDED_MODE } from "@vc-shell/framework";
console.log(navigationViewLocation, BladeInstance, NotificationTemplatesSymbol, BLADE_BACK_BUTTON, TOOLBAR_SERVICE, EMBEDDED_MODE);`,
    );

    runRemoveDeprecatedAliases(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("NavigationViewLocationKey");
    expect(text).toContain("BladeInstanceKey");
    expect(text).toContain("NotificationTemplatesKey");
    expect(text).toContain("BladeBackButtonKey");
    expect(text).toContain("ToolbarServiceKey");
    expect(text).toContain("EmbeddedModeKey");
  });
});
