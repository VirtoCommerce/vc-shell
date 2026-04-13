import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

function createFixtureProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "migrate-idem-"));
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

describe("idempotency", () => {
  it("second run produces zero modifications", async () => {
    const dir = createFixtureProject();

    // First run
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    // Read all files after first run
    const moduleAfterFirst = readFileSync(join(dir, "src", "module.ts"), "utf-8");

    // Second run
    await run({ cwd: dir, dryRun: false, list: false, noReport: true });

    // Files should be unchanged
    const moduleAfterSecond = readFileSync(join(dir, "src", "module.ts"), "utf-8");
    expect(moduleAfterSecond).toBe(moduleAfterFirst);
  });
});
