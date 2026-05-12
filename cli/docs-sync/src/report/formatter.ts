import type { SyncReport, ChangeKind } from "../types.js";

const KINDS: ChangeKind[] = ["created", "updated", "unchanged"];

export function formatReport(report: SyncReport): string {
  const lines: string[] = [];
  lines.push(`# vc-docs sync report — vc-shell@${report.vcShellVersion} — ${report.timestamp}`);
  lines.push("");

  const counts: Record<ChangeKind, number> = { created: 0, updated: 0, unchanged: 0 };
  for (const c of report.changes) counts[c.kind]++;
  const skippedInternal = report.skipped.filter((s) => s.reason === "internal").length;
  const skippedNoFm = report.skipped.filter((s) => s.reason === "no-frontmatter").length;
  const skippedInvalid = report.skipped.filter((s) => s.reason === "invalid-frontmatter").length;

  lines.push("## Summary");
  lines.push(`- Created: ${counts.created}`);
  lines.push(`- Updated: ${counts.updated}`);
  lines.push(`- Unchanged: ${counts.unchanged}`);
  lines.push(`- Skipped (no frontmatter): ${skippedNoFm}`);
  lines.push(`- Skipped (internal): ${skippedInternal}`);
  lines.push(`- Skipped (invalid frontmatter): ${skippedInvalid}`);
  lines.push(`- Orphaned: ${report.orphans.length}`);
  lines.push(`- Errors: ${report.errors.length}`);
  lines.push("");

  for (const kind of KINDS) {
    const list = report.changes.filter((c) => c.kind === kind);
    if (list.length === 0) continue;
    lines.push(`## ${capitalize(kind)}`);
    for (const c of list) lines.push(`- ${c.target}  (← ${c.source})`);
    lines.push("");
  }

  if (report.orphans.length > 0) {
    lines.push("## Orphaned (synced previously, source gone)");
    for (const o of report.orphans) lines.push(`- ${o.target}`);
    lines.push("");
  }

  if (report.skipped.length > 0) {
    lines.push("## Skipped");
    for (const s of report.skipped)
      lines.push(`- ${s.source}  — reason: ${s.reason}${s.detail ? ` (${s.detail})` : ""}`);
    lines.push("");
  }

  lines.push("## Errors");
  if (report.errors.length === 0) {
    lines.push("(none)");
  } else {
    for (const e of report.errors) lines.push(`- ${e.source}: ${e.message}`);
  }
  lines.push("");

  return lines.join("\n");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
