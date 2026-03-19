import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const ICON_SUGGESTIONS: Record<string, string> = {
  "fa-check": "check (Material Symbols)",
  "fa-times": "close (Material Symbols)",
  "fa-plus": "add (Material Symbols)",
  "fa-edit": "edit (Material Symbols)",
  "fa-trash": "delete (Material Symbols)",
  "fa-trash-alt": "delete (Material Symbols)",
  "fa-search": "search (Material Symbols)",
  "fa-save": "save (Material Symbols)",
  "fa-cog": "settings (Material Symbols)",
  "fa-user": "person (Material Symbols)",
  "fa-download": "download (Material Symbols)",
  "fa-upload": "upload (Material Symbols)",
  "fa-chevron-right": "chevron_right (Material Symbols)",
  "fa-chevron-left": "chevron_left (Material Symbols)",
  "fa-arrow-left": "arrow_back (Material Symbols)",
};

const FA_PATTERN = /\b(?:fas?|far|fal|fab)\s+(fa-[\w-]+)/g;

export function runIconAudit(
  project: Project,
  _options: TransformOptions,
): TransformResult {
  const result: TransformResult = {
    filesModified: [],
    filesSkipped: [],
    warnings: [],
    errors: [],
  };

  // icon name → occurrence count
  const iconCounts = new Map<string, number>();

  for (const sourceFile of project.getSourceFiles()) {
    const text = sourceFile.getFullText();
    FA_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = FA_PATTERN.exec(text)) !== null) {
      const iconName = match[1]; // e.g. "fa-check"
      iconCounts.set(iconName, (iconCounts.get(iconName) ?? 0) + 1);
    }
  }

  if (iconCounts.size === 0) {
    return result;
  }

  result.warnings.push(
    `[icon-audit] Found ${iconCounts.size} unique Font Awesome icon(s) across project source files:`,
  );

  const sorted = [...iconCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [icon, count] of sorted) {
    const suggestion = ICON_SUGGESTIONS[icon];
    const hint = suggestion ? ` → suggested replacement: ${suggestion}` : "";
    result.warnings.push(
      `  ${icon} (${count} occurrence${count !== 1 ? "s" : ""})${hint}`,
    );
  }

  result.warnings.push(
    "[icon-audit] Action required: replace Font Awesome classes with Material Symbols icon names in VcIcon usage.",
  );

  return result;
}
