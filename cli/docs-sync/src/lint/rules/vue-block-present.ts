import matter from "gray-matter";
import type { LintRule, LintIssue } from "../runner.js";

export const vueBlockPresent: LintRule = {
  name: "vue-block-present",
  check(file): LintIssue[] {
    const parsed = matter(file.raw);
    if ((parsed.data?.category as string) !== "components") return [];
    if (/```vue\b/.test(parsed.content)) return [];
    return [
      {
        rule: "vue-block-present",
        file: file.relPath,
        severity: "warning",
        message: "component page contains no ```vue example block",
      },
    ];
  },
};
