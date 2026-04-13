import { readFileSync } from "node:fs";
import { join } from "node:path";
import writeFileAtomic from "write-file-atomic";
import type { TransformReport } from "./transforms/types.js";

/** Migration guides without automated transforms — for "Not Covered" section */
const UNCOVERED_GUIDES = [
  { guide: "03-moment-to-datefns", grep: "moment", description: "moment.js → date-fns migration" },
  { guide: "08-dynamic-views-removal", grep: "DynamicBladeList|DynamicBladeForm", description: "Remove DynamicBladeList/DynamicBladeForm" },
  { guide: "16-login-form", grep: "useLogin", description: "useLogin composable API changes" },
  { guide: "29-vc-table-to-data-table", grep: "VcTable\\b", description: "Old VcTable → VcDataTable migration" },
];

export function generateMigrationReport(
  cwd: string,
  currentVersion: string,
  targetVersion: string,
  allReports: TransformReport[],
  depChanges: string[],
  sourceFiles: string[],
): void {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];
  lines.push(`# Migration Report: ${currentVersion} → ${targetVersion}`);
  lines.push(`Generated: ${date}\n`);

  // Automated changes
  const modified = allReports.filter((r) => r.filesModified.length > 0);
  const totalModified = allReports.reduce((sum, r) => sum + r.filesModified.length, 0);
  lines.push(`## Automated Changes (${totalModified} files)\n`);
  for (const r of modified) {
    lines.push(`- ✅ **${r.name}** — ${r.filesModified.length} file(s)`);
  }
  if (modified.length === 0) lines.push("_No automated changes applied._");

  // Manual migration required
  const manualItems = allReports.flatMap((r) => r.reports.map((msg) => ({ transform: r.name, message: msg })));
  if (manualItems.length > 0) {
    lines.push(`\n## Manual Migration Required (${manualItems.length} items)\n`);
    for (const item of manualItems) {
      lines.push(`- ⚠ **${item.transform}** — ${item.message}`);
    }
  }

  // Rolled back
  const rolledBack = allReports.flatMap((r) => r.filesRolledBack.map((f) => ({ transform: r.name, ...f })));
  if (rolledBack.length > 0) {
    lines.push(`\n## Rolled Back (parse errors)\n`);
    for (const item of rolledBack) {
      lines.push(`- ⟲ **${item.transform}** — \`${item.path}\`: ${item.error}`);
    }
  }

  // Dependencies updated
  if (depChanges.length > 0) {
    lines.push(`\n## Dependencies Updated\n`);
    for (const c of depChanges) {
      lines.push(`- ${c}`);
    }
  }

  // Not covered by migrator — scan source files for relevance
  const allSource = sourceFiles.map((f) => { try { return readFileSync(f, "utf-8"); } catch { return ""; } }).join("\n");
  const relevant = UNCOVERED_GUIDES.filter((g) => new RegExp(g.grep).test(allSource));
  if (relevant.length > 0) {
    lines.push(`\n## Not Covered by Migrator\n`);
    lines.push("_These migration guides may be relevant — check manually:_\n");
    for (const g of relevant) {
      lines.push(`- **${g.guide}** — ${g.description}`);
      lines.push(`  Check: \`grep -rn "${g.grep}" src/\``);
    }
  }

  writeFileAtomic.sync(join(cwd, "MIGRATION_REPORT.md"), lines.join("\n") + "\n");
}
