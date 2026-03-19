import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runNotificationMigration } from "../../../src/transforms/notification-migration";

describe("notification-migration transform", () => {
  it("renames useNotifications import and call sites", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useNotifications } from "@vc-shell/framework";
const { notification } = useNotifications();`,
    );

    const result = runNotificationMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("useBladeNotifications");
    expect(text).not.toMatch(/\buseNotifications\b/);
    expect(result.filesModified).toHaveLength(1);
  });

  it("skips files without useNotifications", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `import { ref } from "vue";`);

    const result = runNotificationMigration(project, { dryRun: false, cwd: "." });
    expect(result.filesModified).toHaveLength(0);
  });

  it("handles destructured usage correctly", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useNotifications } from "@vc-shell/framework";
const notifications = useNotifications();
notifications.show("hello");`,
    );

    runNotificationMigration(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain("useBladeNotifications");
    // Call site should be renamed too
    expect(text).toContain("useBladeNotifications()");
    expect(text).not.toMatch(/\buseNotifications\b/);
  });
});
