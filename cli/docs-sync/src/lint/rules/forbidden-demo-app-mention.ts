import type { LintRule, LintIssue } from "../runner.js";

const FORBIDDEN_RE = /\b(vendor-portal|Vendor Portal|vendor portal)\b/;
const ALLOWLIST_RE = /(^|\/)(CHANGELOG|MIGRATION|migration|release|releases)[^/]*\.(md|docs\.md)$/i;

export const forbiddenDemoAppMention: LintRule = {
  name: "forbidden-demo-app-mention",
  check(file): LintIssue[] {
    if (ALLOWLIST_RE.test(file.relPath)) return [];
    if (!FORBIDDEN_RE.test(file.raw)) return [];
    return [
      {
        rule: "forbidden-demo-app-mention",
        file: file.relPath,
        severity: "error",
        message: "VC-Shell docs must not use vendor-portal as a canonical example",
      },
    ];
  },
};
