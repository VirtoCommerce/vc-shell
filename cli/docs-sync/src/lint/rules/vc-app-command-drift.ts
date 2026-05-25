import type { LintRule, LintIssue } from "../runner.js";

const REQUIRED = [
  "/vc-app create",
  "/vc-app connect",
  "/vc-app generate",
  "/vc-app design",
  "/vc-app promote",
  "/vc-app migrate",
];

export const vcAppCommandDrift: LintRule = {
  name: "vc-app-command-drift",
  check(file): LintIssue[] {
    if (!file.relPath.endsWith("cli/vc-app-skill/runtime/vc-app.md")) return [];
    const missing = REQUIRED.filter((cmd) => !file.raw.includes(cmd));
    if (missing.length === 0) return [];
    return [
      {
        rule: "vc-app-command-drift",
        file: file.relPath,
        severity: "warning",
        message: `expected public vc-app command list to mention: ${missing.join(", ")}`,
      },
    ];
  },
};
