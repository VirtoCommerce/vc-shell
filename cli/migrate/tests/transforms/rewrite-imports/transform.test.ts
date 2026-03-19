import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runRewriteImports } from "../../../src/transforms/rewrite-imports";

describe("rewrite-imports transform", () => {
  it("splits AI agent symbols into sub-entry point import", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useAiAgent, ref } from "@vc-shell/framework";`,
    );

    const result = runRewriteImports(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    // ref stays in main import
    expect(text).toContain(`from "@vc-shell/framework"`);
    expect(text).toContain("ref");
    // useAiAgent moves to sub-entry
    expect(text).toContain(`from "@vc-shell/framework/ai-agent"`);
    expect(text).toContain("useAiAgent");
    expect(result.filesModified).toHaveLength(1);
  });

  it("splits extensions symbols into sub-entry point import", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { defineExtensionPoint, useExtensionPoint, computed } from "@vc-shell/framework";`,
    );

    runRewriteImports(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain(`from "@vc-shell/framework/extensions"`);
    expect(text).toContain("defineExtensionPoint");
    expect(text).toContain("useExtensionPoint");
    expect(text).toContain(`from "@vc-shell/framework"`);
    expect(text).toContain("computed");
  });

  it("removes original import if ALL specifiers are moved", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useAiAgent, useAiAgentContext } from "@vc-shell/framework";`,
    );

    runRewriteImports(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    // Original import should be removed (all specifiers moved)
    expect(text).not.toMatch(/from\s+["']@vc-shell\/framework["']\s*;/);
    expect(text).toContain(`from "@vc-shell/framework/ai-agent"`);
  });

  it("handles both AI agent and extensions in same file", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import { useAiAgent, defineExtensionPoint, ref } from "@vc-shell/framework";`,
    );

    runRewriteImports(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain(`from "@vc-shell/framework/ai-agent"`);
    expect(text).toContain(`from "@vc-shell/framework/extensions"`);
    expect(text).toContain(`from "@vc-shell/framework"`);
    expect(text).toContain("ref");
  });

  it("skips files without framework imports", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("test.ts", `import { ref } from "vue";`);

    const result = runRewriteImports(project, { dryRun: false, cwd: "." });
    expect(result.filesModified).toHaveLength(0);
  });

  it("skips files with no symbols to move", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile(
      "test.ts",
      `import { ref, computed } from "@vc-shell/framework";`,
    );

    const result = runRewriteImports(project, { dryRun: false, cwd: "." });
    expect(result.filesModified).toHaveLength(0);
  });
});
