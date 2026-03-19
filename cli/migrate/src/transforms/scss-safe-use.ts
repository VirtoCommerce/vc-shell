import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const SAFE_IMPORT_PATTERN = /^@import\s+['"]tailwind['"]/m;

function collectScssFiles(dir: string): string[] {
  const files: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      files.push(...collectScssFiles(full));
    } else if (entry.endsWith(".scss")) {
      files.push(full);
    }
  }
  return files;
}

export function runScssSafeUse(
  _project: Project,
  options: TransformOptions,
): TransformResult {
  const result: TransformResult = {
    filesModified: [],
    filesSkipped: [],
    warnings: [],
    errors: [],
  };

  const scssFiles = collectScssFiles(options.cwd);

  // Detect safe @import → @use candidates
  const safeConversions: string[] = [];
  for (const file of scssFiles) {
    let content: string;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (SAFE_IMPORT_PATTERN.test(content)) {
      safeConversions.push(file);
    }
  }

  if (safeConversions.length > 0) {
    result.warnings.push(
      `[scss-safe-use] Found ${safeConversions.length} file(s) with safe @import 'tailwind' → @use 'tailwind' conversion:`,
    );
    for (const f of safeConversions) {
      result.warnings.push(`  ${f}`);
    }
  }

  // Always print manual checklist
  result.warnings.push("[scss-safe-use] Manual checklist:");
  result.warnings.push(
    "  - Check for @import statements that can be converted to @use",
  );
  result.warnings.push(
    "  - Remove old base.scss/colors.scss if present",
  );
  result.warnings.push(
    "  - Move custom styles to appropriate files",
  );

  return result;
}
