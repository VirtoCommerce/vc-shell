import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

function createFixtureProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "migrate-report-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "test-app",
      dependencies: { "@vc-shell/framework": "^1.0.0" },
    }),
  );
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "module.ts"),
    `import { createAppModule } from "@vc-shell/framework";\nexport default createAppModule(pages, locales);\n`,
  );
  return dir;
}

describe("migration report", () => {
  it("generates MIGRATION_REPORT.md after migration", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: false, list: false });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(true);

    const content = readFileSync(reportPath, "utf-8");
    expect(content).toContain("Migration Report");
    expect(content).toContain("Automated Changes");
    expect(content).toContain("define-app-module");
  });

  it("skips report in dry-run mode", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: true, list: false });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(false);
  });

  it("skips report with noReport option", async () => {
    const dir = createFixtureProject();
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    const reportPath = join(dir, "MIGRATION_REPORT.md");
    expect(existsSync(reportPath)).toBe(false);
  });
});
