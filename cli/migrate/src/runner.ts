import chalk from "chalk";
import { resolve, join } from "node:path";
import { readFileSync, readdirSync, statSync } from "node:fs";
import writeFileAtomic from "write-file-atomic";
import jscodeshift from "jscodeshift";
import { detectFrameworkVersion } from "./version-detector.js";
import { selectTransforms, transforms } from "./transforms/registry.js";
import type { TransformModule, TransformReport } from "./transforms/types.js";

export interface RunOptions {
  cwd: string;
  to?: string;
  transform?: string;
  dryRun: boolean;
  list: boolean;
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

  // Glob source files for per-file transforms
  const srcDir = join(cwd, "src");
  const sourceFiles = findFiles(srcDir, [".ts", ".vue"]);

  for (const t of selected) {
    console.log(chalk.blue(`\nRunning: ${t.name}...`));

    // Dynamic import of transform module
    const mod: TransformModule = await import(t.transformPath);
    const transform = mod.default;
    const parser = mod.parser ?? "tsx";
    const j = jscodeshift.withParser(parser);

    const report: TransformReport = {
      name: t.name,
      filesModified: [],
      filesSkipped: [],
      filesErrored: [],
      reports: [],
    };

    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg: string) => report.reports.push(msg),
    };

    if (t.scope === "project") {
      // Project-scoped transforms run once with cwd
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
      // Per-file transforms
      for (const filePath of sourceFiles) {
        try {
          const source = readFileSync(filePath, "utf-8");
          const result = transform(
            { path: filePath, source },
            api as any,
            { cwd } as any,
          );

          if (result != null && result !== source) {
            if (!options.dryRun) {
              writeFileAtomic.sync(filePath, result);
            }
            report.filesModified.push(filePath);
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

    // Print report
    if (report.filesModified.length > 0) {
      console.log(chalk.green(`  Modified: ${report.filesModified.length} file(s)`));
    }
    if (report.reports.length > 0) {
      report.reports.forEach((w) => console.log(chalk.yellow(`  ⚠ ${w}`)));
    }
    if (report.filesErrored.length > 0) {
      report.filesErrored.forEach((e) =>
        console.log(chalk.red(`  ✗ ${e.path}: ${e.error}`)),
      );
    }
  }

  if (options.dryRun) {
    console.log(chalk.yellow("\nDry run complete. No files were modified."));
  } else {
    console.log(chalk.green("\nAll transforms applied successfully."));
  }
}

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry.startsWith(".") || entry === "dist") continue;
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...findFiles(full, extensions));
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        results.push(full);
      }
    } catch {
      continue;
    }
  }
  return results;
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
