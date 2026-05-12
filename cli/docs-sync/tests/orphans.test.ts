import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { findOrphans } from "../src/report/orphans.js";

describe("findOrphans", () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-orphans-"));
  });
  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("flags files with AUTO-GENERATED marker that are not in synced set", async () => {
    await fs.mkdir(path.join(tmp, "components/misc"), { recursive: true });
    await fs.writeFile(
      path.join(tmp, "components/misc/old-button.md"),
      "<!-- AUTO-GENERATED FROM vc-shell — DO NOT EDIT MANUALLY -->\n# Old",
    );
    await fs.writeFile(
      path.join(tmp, "components/misc/vc-button.md"),
      "<!-- AUTO-GENERATED FROM vc-shell — DO NOT EDIT MANUALLY -->\n# New",
    );
    const synced = new Set(["components/misc/vc-button.md"]);
    const orphans = await findOrphans(tmp, synced);
    expect(orphans.map((o) => o.target)).toEqual(["components/misc/old-button.md"]);
  });

  it("ignores manual files (no marker)", async () => {
    await fs.mkdir(path.join(tmp, "guides"), { recursive: true });
    await fs.writeFile(path.join(tmp, "guides/intro.md"), "# manual page");
    const orphans = await findOrphans(tmp, new Set());
    expect(orphans).toEqual([]);
  });
});
