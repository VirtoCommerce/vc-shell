import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { writePagesFiles } from "../src/writer/pages.js";

describe("writePagesFiles", () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "docs-sync-pages-"));
  });
  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("emits a top-level components/.pages with subgroups in declared order", async () => {
    await writePagesFiles(tmp, {
      synced: [
        { target: "components/data-display/vc-data-table.md", title: "VcDataTable" },
        { target: "components/misc/vc-button.md", title: "VcButton" },
      ],
    });
    const top = await fs.readFile(path.join(tmp, "components/.pages"), "utf8");
    expect(top).toContain("AUTO-GENERATED FROM vc-shell");
    expect(top).toContain("title: Components");
    expect(top.indexOf("data-display")).toBeLessThan(top.indexOf("misc"));
  });

  it("emits a per-group .pages alphabetically by title", async () => {
    await writePagesFiles(tmp, {
      synced: [
        { target: "components/form/vc-input.md", title: "VcInput" },
        { target: "components/form/vc-checkbox.md", title: "VcCheckbox" },
        { target: "components/form/vc-select.md", title: "VcSelect" },
      ],
    });
    const group = await fs.readFile(path.join(tmp, "components/form/.pages"), "utf8");
    const lines = group.split("\n").filter((l) => l.startsWith("  - "));
    expect(lines).toEqual(["  - VcCheckbox: vc-checkbox.md", "  - VcInput: vc-input.md", "  - VcSelect: vc-select.md"]);
  });

  it("does NOT emit .pages for concepts (mixed-folder)", async () => {
    await writePagesFiles(tmp, {
      synced: [{ target: "concepts/services.md", title: "Services" }],
    });
    let exists = true;
    try {
      await fs.access(path.join(tmp, "concepts/.pages"));
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });

  it("emits a flat plugins/.pages with explicit titles, alphabetical", async () => {
    await writePagesFiles(tmp, {
      synced: [
        { target: "plugins/signalr.md", title: "SignalR" },
        { target: "plugins/ai-agent.md", title: "AI Agent" },
        { target: "plugins/i18n.md", title: "Internationalization" },
      ],
    });
    const pagesFile = await fs.readFile(path.join(tmp, "plugins/.pages"), "utf8");
    expect(pagesFile).toContain("AUTO-GENERATED FROM vc-shell");
    expect(pagesFile).toContain("title: Plugins");
    const lines = pagesFile.split("\n").filter((l) => l.startsWith("  - "));
    expect(lines).toEqual([
      "  - AI Agent: ai-agent.md",
      "  - Internationalization: i18n.md",
      "  - SignalR: signalr.md",
    ]);
  });

  it("emits Overview: index.md first when a group has an index page", async () => {
    await writePagesFiles(tmp, {
      synced: [
        { target: "composables/services/useDashboard.md", title: "useDashboard" },
        { target: "composables/services/index.md", title: "Services" },
        { target: "composables/services/useToolbar.md", title: "useToolbar" },
      ],
    });
    const pagesFile = await fs.readFile(path.join(tmp, "composables/services/.pages"), "utf8");
    const lines = pagesFile.split("\n").filter((l) => l.startsWith("  - "));
    expect(lines).toEqual([
      "  - Overview: index.md",
      "  - useDashboard: useDashboard.md",
      "  - useToolbar: useToolbar.md",
    ]);
  });
});
