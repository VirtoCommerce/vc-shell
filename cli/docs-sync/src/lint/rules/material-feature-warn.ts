import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

const FEATURE_RE = /(^!!! )|(^=== ")|(^\?\?\? )|(^```mermaid)/m;
const LINE_THRESHOLD = 200;

export const materialFeatureWarn: LintRule = {
  name: "material-feature-warn",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    const lines = parsed.content.split("\n").length;
    if (lines < LINE_THRESHOLD) return [];
    if (FEATURE_RE.test(parsed.content)) return [];
    return [
      {
        rule: "material-feature-warn",
        file: file.relPath,
        severity: "warning",
        message: `${lines}-line page uses no admonition / tabs / details / mermaid — consider breaking up with material features`,
      },
    ];
  },
};
