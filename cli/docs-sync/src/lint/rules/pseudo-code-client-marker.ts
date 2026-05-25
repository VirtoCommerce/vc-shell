import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

const CLIENT_IMPORT_RE =
  /\bimport\s+(?:type\s+)?(?:\{[^}]*\b[A-Z][A-Za-z0-9]*Client\b[^}]*\}|\b[A-Z][A-Za-z0-9]*Client\b)\s+from\s+["']([^"']+)["']/g;

export const pseudoCodeClientMarker: LintRule = {
  name: "pseudo-code-client-marker",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    const issues: LintIssue[] = [];
    const codeBlockRe = /```[\w-]*(?:[^\n`]*)\n([\s\S]*?)```/g;
    for (const match of parsed.content.matchAll(codeBlockRe)) {
      const block = match[1];
      const clientImports = Array.from(block.matchAll(CLIENT_IMPORT_RE)).filter(
        (clientImport) => clientImport[1] !== "@vc-shell/framework",
      );
      if (clientImports.length === 0) continue;
      const firstTwoLines = block.split(/\r?\n/).slice(0, 2).join("\n");
      if (/pseudo-code:/.test(firstTwoLines) || /pseudo-code/.test(match[0].split(/\r?\n/)[0])) continue;
      issues.push({
        rule: "pseudo-code-client-marker",
        file: file.relPath,
        severity: "error",
        message: "examples importing *Client must include a // pseudo-code: marker in the first two lines",
      });
    }
    return issues;
  },
};
