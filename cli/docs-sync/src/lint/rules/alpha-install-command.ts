import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

export const alphaInstallCommand: LintRule = {
  name: "alpha-install-command",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    if (!/@vc-shell\/(?:vc-app-skill|create-vc-app)@alpha/.test(parsed.content)) return [];
    return [
      {
        rule: "alpha-install-command",
        file: file.relPath,
        severity: "warning",
        message: "verify whether public install commands should still use the @alpha dist-tag",
      },
    ];
  },
};
