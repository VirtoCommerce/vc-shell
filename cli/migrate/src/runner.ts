import chalk from "chalk";
import { resolve, join, dirname } from "node:path";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import writeFileAtomic from "write-file-atomic";
import jscodeshift from "jscodeshift";
import { detectFrameworkVersion } from "./version-detector.js";
import { selectTransforms, transforms } from "./transforms/registry.js";
import type { TransformModule, TransformReport } from "./transforms/types.js";
import { parse as parseSFC } from "@vue/compiler-sfc";
import { deduplicateImportSpecifiers } from "./utils/import-dedup.js";

export interface RunOptions {
  cwd: string;
  to?: string;
  transform?: string;
  dryRun: boolean;
  list: boolean;
  updateDeps?: boolean;
  exclude?: string[];
}

const DEFAULT_EXCLUDES = [
  "api_client",
  "*.generated.ts",
  "*.d.ts",
];

export async function run(options: RunOptions): Promise<void> {
  if (options.list) {
    listTransforms();
    return;
  }

  const cwd = resolve(options.cwd);
  const currentVersion = detectFrameworkVersion(cwd);

  if (!currentVersion) {
    console.log(chalk.red("Could not detect @vc-shell/framework version in " + cwd));
    return;
  }

  const targetVersion = options.to ?? "2.0.0";
  console.log(chalk.blue(`Migrating from ${currentVersion} → ${targetVersion}`));

  let selected = selectTransforms(currentVersion, targetVersion);

  if (options.transform) {
    selected = selected.filter((t) => t.name === options.transform);
    if (selected.length === 0) {
      console.log(
        chalk.yellow(
          `Transform "${options.transform}" not found or not applicable for this version range.`,
        ),
      );
      return;
    }
  }

  if (selected.length === 0) {
    console.log(chalk.green("No transforms needed for this version range."));
    return;
  }

  console.log(
    chalk.blue(
      `Running ${selected.length} transform(s)${options.dryRun ? " (dry run)" : ""}:`,
    ),
  );
  selected.forEach((t) => console.log(chalk.gray(`  - ${t.name}: ${t.description}`)));

  const srcDir = join(cwd, "src");
  if (!existsSync(srcDir)) {
    console.log(chalk.yellow(`Warning: No src/ directory found in ${cwd}. Is --cwd correct?`));
    return;
  }

  const allExcludes = [...DEFAULT_EXCLUDES, ...(options.exclude ?? [])];
  const sourceFiles = findFiles(srcDir, [".ts", ".vue"], allExcludes);

  // Pre-pass: collect notification type mappings for auto-migration
  const notifyMap = collectNotifyTypeMap(srcDir);

  let totalModified = 0;
  let totalSkipped = 0;
  let totalExcluded = 0;
  let totalRolledBack = 0;
  let totalWarnings = 0;

  for (const t of selected) {
    console.log(chalk.blue(`\nRunning: ${t.name}...`));

    const mod: TransformModule = await import(t.transformPath);
    const transform = mod.default;
    const parser = mod.parser ?? "tsx";
    const j = jscodeshift.withParser(parser);

    const report: TransformReport = {
      name: t.name,
      filesModified: [],
      filesSkipped: [],
      filesErrored: [],
      filesExcluded: [],
      filesRolledBack: [],
      reports: [],
    };

    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg: string) => report.reports.push(msg),
    };

    if (t.scope === "project") {
      try {
        transform(
          { path: cwd, source: "" },
          api as any,
          { cwd, dryRun: options.dryRun } as any,
        );
      } catch (err) {
        report.filesErrored.push({
          path: cwd,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    } else {
      const files = sourceFiles.filter((f) => {
        if (t.fileExtensions) {
          return t.fileExtensions.some((ext) => f.endsWith(ext));
        }
        return true;
      });

      for (const filePath of files) {
        try {
          let source = readFileSync(filePath, "utf-8");
          // Pre-dedup: clean up any duplicate imports from previous partial migrations
          try {
            source = preDedupSource(source, filePath, j);
          } catch {
            // Pre-dedup failed — proceed with original source
          }
          // Pass per-file notifyTypeMap if this file's module has notifications
          const fileNotifyMap = notifyMap.get(dirname(filePath));
          let result = transform(
            { path: filePath, source },
            api as any,
            { cwd, ...(fileNotifyMap ? { notifyTypeMap: fileNotifyMap } : {}) } as any,
          );

          if (result != null && result !== source) {
            try {
              result = deduplicateImportSpecifiers(result, j);
            } catch {
              // Dedup failed — use result as-is, validation will catch issues
            }

            const validationError = parseValidate(filePath, result, parser);
            if (validationError) {
              report.filesRolledBack.push({ path: filePath, error: validationError });
            } else {
              if (!options.dryRun) {
                writeFileAtomic.sync(filePath, result);
              }
              report.filesModified.push(filePath);
            }
          } else {
            report.filesSkipped.push(filePath);
          }
        } catch (err) {
          report.filesErrored.push({
            path: filePath,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    if (report.filesModified.length > 0) {
      console.log(chalk.green(`  Modified: ${report.filesModified.length} file(s)`));
    }
    if (report.reports.length > 0) {
      report.reports.forEach((w) => console.log(chalk.yellow(`  ⚠ ${w}`)));
    }
    if (report.filesRolledBack.length > 0) {
      report.filesRolledBack.forEach((e) =>
        console.log(chalk.yellow(`  ⟲ ${e.path}: rolled back (${e.error})`)),
      );
    }
    if (report.filesErrored.length > 0) {
      report.filesErrored.forEach((e) =>
        console.log(chalk.red(`  ✗ ${e.path}: ${e.error}`)),
      );
    }

    totalModified += report.filesModified.length;
    totalSkipped += report.filesSkipped.length;
    totalExcluded += report.filesExcluded.length;
    totalRolledBack += report.filesRolledBack.length;
    totalWarnings += report.reports.length;
  }

  let depChanges: string[] = [];
  if (options.updateDeps) {
    depChanges = updateDependencyVersions(cwd, targetVersion, options.dryRun);
  }

  console.log(chalk.blue("\n─── Migration Summary ───"));
  console.log(`  Files modified:    ${totalModified}`);
  console.log(`  Files skipped:     ${totalSkipped}`);
  if (totalExcluded > 0) {
    console.log(chalk.gray(`  Files excluded:    ${totalExcluded}`));
  }
  if (totalRolledBack > 0) {
    console.log(chalk.yellow(`  Files rolled back: ${totalRolledBack}`));
  }
  if (totalWarnings > 0) {
    console.log(chalk.yellow(`  Warnings:          ${totalWarnings} (manual review needed)`));
  }

  if (depChanges.length > 0) {
    console.log(chalk.blue("\n  Dependencies updated:"));
    depChanges.forEach((c) => console.log(`    ${c}`));
    console.log(chalk.yellow("\n  ⚠ Run `yarn install` to update the lockfile."));
  }

  if (options.dryRun) {
    console.log(chalk.yellow("\nDry run complete. No files were modified."));
  } else {
    console.log(chalk.green("\nMigration complete."));
  }
}

// Scan src/modules/{module}/components/notifications/{file}.vue to build a mapping
// of notifyType event names to file names, keyed by module directory.
function collectNotifyTypeMap(
  srcDir: string,
): Map<string, Record<string, Record<string, string>>> {
  const result = new Map<string, Record<string, Record<string, string>>>();
  const modulesDir = join(srcDir, "modules");
  if (!existsSync(modulesDir)) return result;

  let moduleEntries: string[];
  try {
    moduleEntries = readdirSync(modulesDir, { encoding: "utf-8" });
  } catch {
    return result;
  }

  for (const moduleEntry of moduleEntries) {
    const moduleDir = join(modulesDir, moduleEntry);
    try {
      if (!statSync(moduleDir).isDirectory()) continue;
    } catch {
      continue;
    }

    const notifDir = join(moduleDir, "components", "notifications");
    if (!existsSync(notifDir)) continue;

    const notifications: Record<string, string> = {};
    let files: string[];
    try {
      files = readdirSync(notifDir, { encoding: "utf-8" });
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".vue")) continue;
      try {
        const filePath = join(notifDir, file);
        const source = readFileSync(filePath, "utf-8");
        const { descriptor } = parseSFC(source, { filename: filePath });
        const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
        if (!scriptBlock) continue;

        const match = scriptBlock.content.match(
          /(?:defineOptions|defineBlade)\s*\(\s*\{[^}]*notifyType\s*:\s*["']([^"']+)["']/s,
        );
        if (match) {
          notifications[match[1]] = file;
        }
      } catch {
        continue;
      }
    }

    if (Object.keys(notifications).length > 0) {
      result.set(moduleDir, { "./components/notifications": notifications });
    }
  }

  return result;
}

function findFiles(dir: string, extensions: string[], excludes: string[]): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry.startsWith(".") || entry === "dist") continue;
    if (excludes.includes(entry)) continue;
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...findFiles(full, extensions, excludes));
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        const excluded = excludes.some((pattern) => {
          if (pattern.startsWith("*")) {
            return entry.endsWith(pattern.slice(1));
          }
          return entry === pattern;
        });
        if (!excluded) {
          results.push(full);
        }
      }
    } catch {
      continue;
    }
  }
  return results;
}

/**
 * Pre-dedup source before passing to transform.
 * For .vue files: extract script block, dedup, splice back.
 * For .ts files: dedup directly.
 */
/**
 * Collapse multi-line import statements into single lines so the
 * text-based dedup can process them. Only affects import blocks.
 */
function collapseMultiLineImports(script: string): string {
  return script.replace(
    /import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gs,
    (match) => match.replace(/\s*\n\s*/g, " "),
  );
}

function preDedupSource(source: string, filePath: string, j: any): string {
  if (filePath.endsWith(".vue")) {
    const { descriptor } = parseSFC(source, { filename: filePath });
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) return source;

    // Collapse multi-line imports so text-based dedup can handle them
    const collapsed = collapseMultiLineImports(scriptBlock.content);
    const deduped = deduplicateImportSpecifiers(collapsed, j);
    if (deduped === scriptBlock.content) return source;

    const start = scriptBlock.loc.start.offset;
    const end = scriptBlock.loc.end.offset;
    return source.substring(0, start) + deduped + source.substring(end);
  }
  return deduplicateImportSpecifiers(source, j);
}

function parseValidate(filePath: string, source: string, parser: string): string | null {
  try {
    if (filePath.endsWith(".vue")) {
      const { descriptor, errors } = parseSFC(source, { filename: filePath });
      if (errors.length > 0) {
        return `SFC parse error: ${errors[0].message}`;
      }
      const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
      if (scriptBlock) {
        jscodeshift.withParser(parser)(scriptBlock.content);
      }
    } else {
      jscodeshift.withParser(parser)(source);
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

function updateDependencyVersions(
  cwd: string,
  targetVersion: string,
  dryRun: boolean,
): string[] {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return [];

  const pkgRaw = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw);
  const changes: string[] = [];

  for (const depType of ["dependencies", "devDependencies"] as const) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (name.startsWith("@vc-shell/")) {
        const oldVersion = deps[name];
        const newVersion = `^${targetVersion}`;
        if (oldVersion !== newVersion) {
          changes.push(`${name}: ${oldVersion} → ${newVersion}`);
          deps[name] = newVersion;
        }
      }
    }
  }

  if (changes.length > 0 && !dryRun) {
    writeFileAtomic.sync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  return changes;
}

function listTransforms(): void {
  console.log(chalk.blue("Available transforms:\n"));
  for (const t of transforms) {
    const tag = t.diagnosticOnly ? chalk.gray(" [diagnostic]") : "";
    const scopeTag = t.scope === "project" ? chalk.gray(" [project]") : "";
    console.log(`  ${chalk.bold(t.name)}${tag}${scopeTag}`);
    console.log(`    ${t.description}`);
    console.log(`    Introduced in: ${t.introducedIn}`);
    if (t.migrationGuideSection) {
      console.log(`    Migration guide: ${t.migrationGuideSection}`);
    }
    console.log();
  }
}
