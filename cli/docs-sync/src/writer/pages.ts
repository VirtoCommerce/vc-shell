import fs from "node:fs/promises";
import path from "node:path";
import { writeAtomic } from "./atomic.js";
import { AUTO_GEN_MARKER } from "../transformer/header.js";

const PAGES_MARKER = `# ${AUTO_GEN_MARKER}\n# To update: edit a *.docs.md in vc-shell, then run yarn docs:sync\n`;

// Top-level group order per category (matches spec).
const GROUP_ORDER: Record<string, string[]> = {
  components: ["layout", "form", "data-display", "feedback", "navigation", "media", "misc"],
  composables: ["blade-navigation", "data", "ui-state", "services", "user", "notifications", "forms", "utilities"],
  reference: ["cli", "api", "modules", "migration"],
};

const TOP_LEVEL_TITLES: Record<string, string> = {
  components: "Components",
  composables: "Composables",
  plugins: "Plugins",
  reference: "Reference",
};

const NESTED_TITLES: Record<string, string> = {
  layout: "Layout",
  form: "Form",
  "data-display": "Data Display",
  feedback: "Feedback",
  navigation: "Navigation",
  media: "Media",
  misc: "Misc",
  "blade-navigation": "Blade Navigation",
  data: "Data",
  "ui-state": "UI State",
  services: "Services",
  user: "User",
  notifications: "Notifications",
  forms: "Forms",
  utilities: "Utilities",
  api: "API",
  directives: "Directives",
  modules: "Modules",
  cli: "CLI",
};

// Folders for which the generator emits .pages.
const AUTO_PAGES_TOP = new Set(["components", "composables", "plugins"]);
const AUTO_PAGES_REFERENCE_SUB = new Set(["api", "api/directives", "modules"]);
// concepts/ and reference root NOT in auto set — manual .pages.

export interface SyncedPage {
  target: string; // e.g. components/data-display/vc-data-table.md
  title: string;
}

export interface WritePagesArgs {
  synced: SyncedPage[];
}

export async function writePagesFiles(targetRoot: string, args: WritePagesArgs): Promise<void> {
  // Bucket by top folder and group.
  const byTopFolder = new Map<string, Map<string, SyncedPage[]>>();
  for (const p of args.synced) {
    const parts = p.target.split("/");
    const top = parts[0];
    const group = parts.length > 2 ? parts.slice(1, -1).join("/") : "";
    if (!byTopFolder.has(top)) byTopFolder.set(top, new Map());
    const groups = byTopFolder.get(top)!;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(p);
  }

  for (const [top, groups] of byTopFolder) {
    const isAutoTop = AUTO_PAGES_TOP.has(top);

    // Emit top-level .pages for components / composables / plugins.
    if (isAutoTop) {
      const hasOnlyRoot = groups.size === 1 && groups.has("");
      let navContent: string;
      if (hasOnlyRoot) {
        // Flat top folder (e.g., plugins/) — emit explicit titles, alphabetical
        const allPages = groups.get("")!;
        const sorted = [...allPages].sort((a, b) => a.title.localeCompare(b.title));
        navContent = sorted.map((p) => `  - ${p.title}: ${path.basename(p.target)}`).join("\n");
      } else {
        // Existing logic: list sub-groups in declared order
        const order = (GROUP_ORDER[top] ?? []).filter((g) => groups.has(g));
        navContent = order.map((g) => `  - ${g}`).join("\n");
      }
      const yaml = PAGES_MARKER + `title: ${TOP_LEVEL_TITLES[top]}\n` + `nav:\n` + navContent + "\n";
      const filePath = path.join(targetRoot, top, ".pages");
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await writeAtomic(filePath, yaml);
    }

    // Emit per-group .pages.
    for (const [group, pages] of groups) {
      if (!group) continue; // single-file in top folder (e.g. concepts/services.md) — no group .pages
      const isReferenceSub = top === "reference" && AUTO_PAGES_REFERENCE_SUB.has(group);
      if (!isAutoTop && !isReferenceSub) continue; // skip mixed/manual folders

      const indexPage = pages.find((p) => path.basename(p.target) === "index.md");
      const otherPages = pages.filter((p) => path.basename(p.target) !== "index.md");
      const sorted = [...otherPages].sort((a, b) => a.title.localeCompare(b.title));
      const groupTitle = NESTED_TITLES[group.split("/").at(-1)!] ?? group;

      const navLines: string[] = [];
      if (indexPage) navLines.push("  - Overview: index.md");
      navLines.push(...sorted.map((p) => `  - ${p.title}: ${path.basename(p.target)}`));

      const yaml = PAGES_MARKER + `title: ${groupTitle}\n` + `nav:\n` + navLines.join("\n") + "\n";

      const filePath = path.join(targetRoot, top, group, ".pages");
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await writeAtomic(filePath, yaml);
    }
  }
}
