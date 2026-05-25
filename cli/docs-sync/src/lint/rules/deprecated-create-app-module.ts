import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

export const deprecatedCreateAppModule: LintRule = {
  name: "deprecated-create-app-module",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    if (!/\bcreateAppModule\b/.test(parsed.content)) return [];
    if (/(deprecated|legacy|migration|migrate)/i.test(parsed.content)) return [];
    return [
      {
        rule: "deprecated-create-app-module",
        file: file.relPath,
        severity: "warning",
        message: "createAppModule should only appear in deprecated or migration sections",
      },
    ];
  },
};
