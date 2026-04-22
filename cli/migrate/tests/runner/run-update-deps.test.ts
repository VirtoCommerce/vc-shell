// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run } from "../../src/runner";

vi.mock("../../src/baseline-versions", () => ({
  BASELINE_VERSIONS: {
    eslint: "^9.35.0",
  },
}));

describe("run — updateDeps with same current and target version", () => {
  it("applies baseline alignment even when no transforms are selected", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "runner-update-deps-"));
    writeFileSync(
      join(cwd, "package.json"),
      JSON.stringify(
        {
          dependencies: { "@vc-shell/framework": "^2.0.0-alpha.33" },
          devDependencies: { eslint: "^8.0.0" },
        },
        null,
        2,
      ) + "\n",
    );

    await run({
      cwd,
      to: "2.0.0-alpha.33",
      updateDeps: true,
      dryRun: false,
      list: false,
      noReport: true,
    });

    const updated = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    expect(updated.devDependencies.eslint).toBe("^9.35.0");
    expect(updated.dependencies["@vc-shell/framework"]).toBe("^2.0.0-alpha.33"); // unchanged
  });
});
