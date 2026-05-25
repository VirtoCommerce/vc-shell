import matter from "gray-matter";
import { validateFrontmatter } from "../../parser/frontmatter.js";
import type { LintRule, LintIssue } from "../runner.js";

export const frontmatterRequired: LintRule = {
  name: "frontmatter-required",
  check(file): LintIssue[] {
    if (!file.relPath.endsWith(".docs.md")) return [];
    const parsed = matter(file.raw);
    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      return [{ rule: "frontmatter-required", file: file.relPath, severity: "error", message: "missing frontmatter" }];
    }
    const v = validateFrontmatter(parsed.data);
    if (!v.success) {
      return [{ rule: "frontmatter-required", file: file.relPath, severity: "error", message: v.error }];
    }
    return [];
  },
};
