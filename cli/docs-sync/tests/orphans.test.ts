import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { findOrphans, removeOrphans } from "../src/report/orphans.js";

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

  it("removeOrphans deletes the pages and marks them removed, keeping the rest", async () => {
    const marker = "<!-- AUTO-GENERATED FROM vc-shell — DO NOT EDIT MANUALLY -->\n";
    await fs.mkdir(path.join(tmp, "composables/ui-state"), { recursive: true });
    await fs.writeFile(path.join(tmp, "composables/ui-state/gone.md"), marker + "# Gone");
    await fs.writeFile(path.join(tmp, "composables/ui-state/kept.md"), marker + "# Kept");
    const orphans = await findOrphans(tmp, new Set(["composables/ui-state/kept.md"]));
    const removed = await removeOrphans(tmp, orphans);
    expect(removed).toEqual([{ target: "composables/ui-state/gone.md", removed: true }]);
    await expect(fs.access(path.join(tmp, "composables/ui-state/gone.md"))).rejects.toThrow();
    await expect(fs.access(path.join(tmp, "composables/ui-state/kept.md"))).resolves.toBeUndefined();
  });

  it("removeOrphans drops a folder left with only its .nav.yml, not one with other files", async () => {
    const marker = "<!-- AUTO-GENERATED FROM vc-shell — DO NOT EDIT MANUALLY -->\n";
    await fs.mkdir(path.join(tmp, "components/old"), { recursive: true });
    await fs.writeFile(path.join(tmp, "components/old/a.md"), marker + "# A");
    await fs.writeFile(path.join(tmp, "components/old/.nav.yml"), "nav: []\n");
    await fs.mkdir(path.join(tmp, "components/mixed"), { recursive: true });
    await fs.writeFile(path.join(tmp, "components/mixed/b.md"), marker + "# B");
    await fs.writeFile(path.join(tmp, "components/mixed/manual.md"), "# manual");
    await removeOrphans(tmp, await findOrphans(tmp, new Set()));
    await expect(fs.access(path.join(tmp, "components/old"))).rejects.toThrow();
    await expect(fs.access(path.join(tmp, "components/mixed/manual.md"))).resolves.toBeUndefined();
  });
});
