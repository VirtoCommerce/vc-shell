import type { LintRule, LintIssue } from "../runner.js";

const BLOCK_RE = /```mermaid\n([\s\S]*?)```/g;

export const mermaidSyntax: LintRule = {
  name: "mermaid-syntax",
  check(file): LintIssue[] {
    const out: LintIssue[] = [];
    for (const m of file.raw.matchAll(BLOCK_RE)) {
      const body = m[1].trim();
      if (!body) {
        out.push({ rule: "mermaid-syntax", file: file.relPath, severity: "error", message: "empty mermaid block" });
        continue;
      }
      // Crude: must start with a recognized diagram keyword.
      if (
        !/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)\b/.test(
          body,
        )
      ) {
        out.push({
          rule: "mermaid-syntax",
          file: file.relPath,
          severity: "error",
          message: "mermaid block does not start with a known diagram keyword",
        });
      }
    }
    return out;
  },
};
