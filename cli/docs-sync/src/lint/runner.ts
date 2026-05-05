import { frontmatterRequired } from "./rules/frontmatter-required.js";
import { storybookIdValid } from "./rules/storybook-id-valid.js";
import { imageSizeLimit } from "./rules/image-size-limit.js";
import { vueBlockPresent } from "./rules/vue-block-present.js";
import { materialFeatureWarn } from "./rules/material-feature-warn.js";
import { mermaidSyntax } from "./rules/mermaid-syntax.js";

export interface LintFile {
  absPath: string;
  relPath: string;
  raw: string;
}

export type LintSeverity = "error" | "warning";

export interface LintIssue {
  rule: string;
  file: string;
  severity: LintSeverity;
  message: string;
}

export interface LintRule {
  name: string;
  check(file: LintFile, ctx: LintContext): LintIssue[] | Promise<LintIssue[]>;
}

export interface LintContext {
  knownStoryIds: Set<string>;
}

export interface LintArgs {
  sources: LintFile[];
  knownStoryIds: Set<string>;
}

export interface LintResult {
  errors: LintIssue[];
  warnings: LintIssue[];
}

const ALL_RULES: LintRule[] = [
  frontmatterRequired,
  storybookIdValid,
  imageSizeLimit,
  vueBlockPresent,
  materialFeatureWarn,
  mermaidSyntax,
];

export async function runLint(args: LintArgs): Promise<LintResult> {
  const errors: LintIssue[] = [];
  const warnings: LintIssue[] = [];
  const ctx: LintContext = { knownStoryIds: args.knownStoryIds };
  for (const file of args.sources) {
    for (const rule of ALL_RULES) {
      const issues = await rule.check(file, ctx);
      for (const issue of issues) {
        if (issue.severity === "error") errors.push(issue);
        else warnings.push(issue);
      }
    }
  }
  return { errors, warnings };
}
