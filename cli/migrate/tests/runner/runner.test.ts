import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Test helper: create a temp project directory with package.json and a source file
function createTempProject(version: string, sourceContent: string) {
  const dir = mkdtempSync(join(tmpdir(), "codemod-runner-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      dependencies: { "@vc-shell/framework": version },
    }),
  );
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "test.ts"), sourceContent);
  return dir;
}

describe("runner", () => {
  it("does not write files in dry-run mode", async () => {
    const { run } = await import("../../src/runner");
    const dir = createTempProject(
      "1.0.0",
      `import { createAppModule } from "@vc-shell/framework";\nexport default createAppModule(pages, locales);`,
    );

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await run({ cwd: dir, to: "2.0.0", dryRun: true, list: false });

    // Verify source file was NOT modified
    const content = readFileSync(join(dir, "src", "test.ts"), "utf-8");
    expect(content).toContain("createAppModule");

    consoleSpy.mockRestore();
  });

  it("lists transforms without error in list mode", async () => {
    const { run } = await import("../../src/runner");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await run({ cwd: ".", to: undefined, dryRun: false, list: true });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
