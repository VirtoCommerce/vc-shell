import type { LintRule, LintIssue } from "../runner.js";

const RE = /::storybook\s+[^\n]*\bid="([^"]+)"/g;

export const storybookIdValid: LintRule = {
  name: "storybook-id-valid",
  check(file, ctx): LintIssue[] {
    const issues: LintIssue[] = [];
    for (const m of file.raw.matchAll(RE)) {
      const id = m[1];
      if (ctx.knownStoryIds.size === 0) continue; // skip when index unavailable
      if (!ctx.knownStoryIds.has(id)) {
        issues.push({
          rule: "storybook-id-valid",
          file: file.relPath,
          severity: "error",
          message: `unknown Storybook story id: "${id}"`,
        });
      }
    }
    return issues;
  },
};
