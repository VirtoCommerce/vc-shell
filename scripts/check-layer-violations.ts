/**
 * Layer Violation Checker
 *
 * Enforces the dependency direction:  core/ → ui/ → shell/ → modules/
 *
 * Rules are configurable via the `rules` array below.
 * Each rule defines: which layer is checked, what import patterns are forbidden,
 * and optional path exclusions (for known exceptions).
 *
 * Usage:
 *   npx tsx scripts/check-layer-violations.ts
 *
 * Add to package.json scripts:
 *   "check:layers": "tsx scripts/check-layer-violations.ts"
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

// ── Configuration ────────────────────────────────────────────────────────────

interface Rule {
  /** Human-readable description */
  description: string;
  /** Directory to scan (relative to framework/) */
  layer: string;
  /** Import patterns that are forbidden (regex) */
  forbidden: RegExp[];
  /** File paths to exclude from this rule (substring match) */
  exceptions?: string[];
  /** Skip test and story files */
  skipTests?: boolean;
}

const rules: Rule[] = [
  {
    description: "core/ must not import from shell/",
    layer: "core",
    forbidden: [/from\s+["']@shell\//],
    skipTests: true,
  },
  {
    description: "core/ must not import from ui/",
    layer: "core",
    forbidden: [/from\s+["']@ui\//],
    exceptions: ["ai-agent/components"],
    skipTests: true,
  },
  {
    description: "ui/ must not import from shell/ (except vc-app — pending slot refactor)",
    layer: "ui",
    forbidden: [/from\s+["']@shell\//],
    exceptions: ["vc-app"],
    skipTests: true,
  },
];

// ── Scanner ──────────────────────────────────────────────────────────────────

interface Violation {
  rule: string;
  file: string;
  line: number;
  text: string;
}

const FRAMEWORK_DIR = path.resolve(__dirname, "..", "framework");
const EXTENSIONS = new Set([".ts", ".vue"]);

function collectFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    let entries: string[];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        // Skip node_modules, dist, .git
        if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
        walk(fullPath);
      } else if (EXTENSIONS.has(path.extname(entry))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function checkRule(rule: Rule): Violation[] {
  const violations: Violation[] = [];
  const layerDir = path.join(FRAMEWORK_DIR, rule.layer);
  const files = collectFiles(layerDir);

  for (const filePath of files) {
    const relativePath = path.relative(FRAMEWORK_DIR, filePath);

    // Skip tests and stories
    if (rule.skipTests) {
      if (relativePath.endsWith(".test.ts") || relativePath.endsWith(".stories.ts")) continue;
    }

    // Check exceptions
    if (rule.exceptions?.some((exc) => relativePath.includes(exc))) continue;

    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of rule.forbidden) {
        if (pattern.test(line)) {
          violations.push({
            rule: rule.description,
            file: relativePath,
            line: i + 1,
            text: line.trim(),
          });
        }
      }
    }
  }

  return violations;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("Checking layer violations in framework/...\n");

  let totalViolations = 0;

  for (const rule of rules) {
    const violations = checkRule(rule);

    if (violations.length > 0) {
      console.log(`\x1b[31mFAIL\x1b[0m ${rule.description}`);
      for (const v of violations) {
        console.log(`  ${v.file}:${v.line}  ${v.text}`);
      }
      console.log();
      totalViolations += violations.length;
    } else {
      console.log(`\x1b[32mPASS\x1b[0m ${rule.description}`);
    }
  }

  console.log();

  if (totalViolations > 0) {
    console.log(`\x1b[31m${totalViolations} violation(s) found.\x1b[0m Fix the imports above.`);
    process.exit(1);
  } else {
    console.log("\x1b[32mAll layer checks passed.\x1b[0m");
    process.exit(0);
  }
}

main();
