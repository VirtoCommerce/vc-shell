import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

const BLADE_FIELD_RE = /\b(url|isWorkspace|permissions|menuItem)\s*:/;

export const bladeMetadataDefineOptions: LintRule = {
  name: "blade-metadata-define-options",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    const issues: LintIssue[] = [];
    const re = /defineOptions\s*\(\s*\{[\s\S]*?\}\s*\)/g;
    for (const match of parsed.content.matchAll(re)) {
      if (!BLADE_FIELD_RE.test(match[0])) continue;
      issues.push({
        rule: "blade-metadata-define-options",
        file: file.relPath,
        severity: "error",
        message:
          "blade metadata must use defineBlade(...), not defineOptions({ url/isWorkspace/permissions/menuItem })",
      });
    }
    return issues;
  },
};
