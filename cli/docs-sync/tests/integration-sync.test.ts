import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_SRC = path.join(__dirname, "fixtures/integration/source");

describe("end-to-end sync (integration)", () => {
  let target: string;

  beforeEach(async () => {
    target = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-int-"));
    // Mock fetch for Storybook index.json.
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ entries: {} }),
    } as Response);
  });

  afterEach(async () => {
    await fs.rm(target, { recursive: true, force: true });
    vi.restoreAllMocks();
    // Restore the fixture file to its committed (Prettier-formatted) state so
    // the working tree stays clean after each test run.
    await fs.writeFile(
      path.join(FIXTURE_SRC, "package.json"),
      JSON.stringify({ version: "0.0.0-test" }, null, 2) + "\n",
      "utf8",
    );
  });

  it("syncs a fixture component, copies images, skips internal files", async () => {
    // Stub framework/package.json under fixture (runSync reads version from it).
    await fs.writeFile(path.join(FIXTURE_SRC, "package.json"), JSON.stringify({ version: "0.0.0-test" }), "utf8");
    const { runSync } = await import("../src/commands/sync.js");
    const res = await runSync({
      target,
      frameworkDir: FIXTURE_SRC,
      reportPath: path.join(target, "report.md"),
    });
    expect(res.exitCode).toBe(0);

    const targetSection = path.join(target, "platform/developer-guide/docs/custom-apps-development/vc-shell");
    const out = await fs.readFile(path.join(targetSection, "components/misc/vc-foo.md"), "utf8");
    expect(out).toContain("AUTO-GENERATED FROM vc-shell");
    expect(out).toContain("# VcFoo");

    // Image was copied.
    await fs.access(path.join(targetSection, "components/misc/images/screen.png"));

    // Internal file skipped.
    let exists = true;
    try {
      await fs.access(path.join(targetSection, "components/misc/secret.md"));
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);

    // Report exists and mentions the synced file.
    const report = await fs.readFile(path.join(target, "report.md"), "utf8");
    expect(report).toContain("components/misc/vc-foo.md");
  });
});
