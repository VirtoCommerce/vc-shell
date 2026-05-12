import fs from "node:fs/promises";
import path from "node:path";
import { findRelativeImageRefs } from "../../parser/images.js";
import type { LintRule, LintIssue } from "../runner.js";

const WARN_BYTES = 500 * 1024;
const ERROR_BYTES = 2 * 1024 * 1024;

export const imageSizeLimit: LintRule = {
  name: "image-size-limit",
  async check(file): Promise<LintIssue[]> {
    const refs = findRelativeImageRefs(file.raw);
    const out: LintIssue[] = [];
    const dir = path.dirname(file.absPath);
    for (const ref of refs) {
      const abs = path.resolve(dir, ref);
      try {
        const stat = await fs.stat(abs);
        if (stat.size > ERROR_BYTES) {
          out.push({
            rule: "image-size-limit",
            file: file.relPath,
            severity: "error",
            message: `${ref} is ${formatKB(stat.size)} (> 2 MB)`,
          });
        } else if (stat.size > WARN_BYTES) {
          out.push({
            rule: "image-size-limit",
            file: file.relPath,
            severity: "warning",
            message: `${ref} is ${formatKB(stat.size)} (> 500 KB)`,
          });
        }
      } catch {
        // missing image — handled by a separate rule if needed
      }
    }
    return out;
  },
};

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}
