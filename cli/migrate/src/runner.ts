import chalk from "chalk";
import { resolve, join, dirname } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import writeFileAtomic from "write-file-atomic";
import jscodeshift from "jscodeshift";
import { detectFrameworkVersion } from "./version-detector.js";
import { selectTransforms, transforms } from "./transforms/registry.js";
import type { TransformModule, TransformReport, VersionedTransform } from "./transforms/types.js";
import { deduplicateImportSpecifiers } from "./utils/import-dedup.js";
import { DEFAULT_EXCLUDES, findFiles, collectNotifyTypeMap } from "./file-scanner.js";
import { preDedupSource, parseValidate } from "./sfc-processor.js";
import { updateDependencyVersions } from "./dep-updater.js";

export interface RunOptions {
  cwd: string;
  to?: string;
  transform?: string;
  dryRun: boolean;
  list: boolean;
  noReport?: boolean;
  updateDeps?: boolean;
  exclude?: string[];
}

/**
 * Detect the version of @vc-shell/migrate package itself — it's published in lockstep
 * with the framework, so its version IS the target version.
 */
function detectLatestFrameworkVersion(): string | null {
  try {
    const migratePkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    if (existsSync(migratePkgPath)) {
      const pkg = JSON.parse(readFileSync(migratePkgPath, "utf-8"));
      return pkg.version ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

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

  const targetVersion = options.to ?? detectLatestFrameworkVersion() ?? "2.0.0";
  console.log(chalk.blue(`Migrating from ${currentVersion} → ${targetVersion}`));

  let selected = selectTransforms(currentVersion, targetVersion);

  if (options.transform) {
    selected = selected.filter((t) => t.name === options.transform);
    if (selected.length === 0) {
      console.log(chalk.yellow(`Transform "${options.transform}" not found or not applicable for this version range.`));
      return;
    }
  }

  selected = topologicalSort(selected);

  if (selected.length === 0) {
    console.log(chalk.green("No transforms needed for this version range."));
    return;
  }

  console.log(chalk.blue(`Running ${selected.length} transform(s)${options.dryRun ? " (dry run)" : ""}:`));
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
        transform({ path: cwd, source: "" }, api as any, { cwd, dryRun: options.dryRun } as any);
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
              const deduped = deduplicateImportSpecifiers(result, j);
              if (deduped !== result) {
                result = deduped;
              }
            } catch {
              // Dedup failed — use result as-is
            }

            // Idempotency: if after dedup the result equals original, skip
            if (result === source) {
              report.filesSkipped.push(filePath);
              continue;
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
      report.filesRolledBack.forEach((e) => console.log(chalk.yellow(`  ⟲ ${e.path}: rolled back (${e.error})`)));
    }
    if (report.filesErrored.length > 0) {
      report.filesErrored.forEach((e) => console.log(chalk.red(`  ✗ ${e.path}: ${e.error}`)));
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

  // Migration report generation (Task 5)
  // if (!options.dryRun && !options.noReport) { generateMigrationReport(...) }

  if (options.dryRun) {
    console.log(chalk.yellow("\nDry run complete. No files were modified."));
  } else {
    console.log(chalk.green("\nMigration complete."));
  }
}

/**
 * Kahn's algorithm: topological sort with stable ordering for unrelated nodes.
 */
export function topologicalSort(transforms: VersionedTransform[]): VersionedTransform[] {
  const nameToIndex = new Map<string, number>();
  transforms.forEach((t, i) => nameToIndex.set(t.name, i));

  const inDegree = new Array(transforms.length).fill(0);
  const dependents = new Map<number, number[]>();

  for (let i = 0; i < transforms.length; i++) {
    for (const dep of transforms[i].after ?? []) {
      const depIdx = nameToIndex.get(dep);
      if (depIdx === undefined) continue;
      inDegree[i]++;
      if (!dependents.has(depIdx)) dependents.set(depIdx, []);
      dependents.get(depIdx)!.push(i);
    }
  }

  const queue: number[] = [];
  for (let i = 0; i < transforms.length; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result: VersionedTransform[] = [];
  while (queue.length > 0) {
    const idx = queue.shift()!;
    result.push(transforms[idx]);
    for (const dep of dependents.get(idx) ?? []) {
      inDegree[dep]--;
      if (inDegree[dep] === 0) queue.push(dep);
    }
  }

  if (result.length !== transforms.length) {
    const missing = transforms.filter((t) => !result.includes(t)).map((t) => t.name);
    throw new Error(`Cycle detected in transform dependencies: ${missing.join(", ")}`);
  }

  return result;
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
