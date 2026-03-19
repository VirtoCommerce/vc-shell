import chalk from "chalk";
import { Project } from "ts-morph";
import { resolve, join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { detectFrameworkVersion } from "./version-detector.js";
import { selectTransforms, transforms } from "./transforms/registry.js";

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

  // Create ts-morph project and add source files
  const project = new Project({
    tsConfigFilePath: undefined,
    skipAddingFilesFromTsConfig: true,
  });

  // Add .ts files from src/
  const srcDir = join(cwd, "src");
  const tsFiles = findFiles(srcDir, ".ts");
  tsFiles.forEach((f) => project.addSourceFileAtPath(f));

  // Run transforms
  for (const transform of selected) {
    console.log(chalk.blue(`\nRunning: ${transform.name}...`));
    const result = transform.run(project, { dryRun: options.dryRun, cwd });

    if (result.filesModified.length > 0) {
      console.log(chalk.green(`  Modified: ${result.filesModified.length} file(s)`));
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach((w) => console.log(chalk.yellow(`  ⚠ ${w}`)));
    }
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.log(chalk.red(`  ✗ ${e}`)));
    }
  }

  // Save changes (unless dry-run)
  if (!options.dryRun) {
    await project.save();
    console.log(chalk.green("\nAll transforms applied successfully."));
  } else {
    console.log(chalk.yellow("\nDry run complete. No files were modified."));
  }
}

/** Recursively collect files with a given extension under a directory. */
function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir, { encoding: "utf-8" });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...findFiles(full, ext));
    } else if (entry.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function listTransforms(): void {
  console.log(chalk.blue("Available transforms:\n"));
  for (const t of transforms) {
    const tag = t.diagnosticOnly ? chalk.gray(" [diagnostic]") : "";
    console.log(`  ${chalk.bold(t.name)}${tag}`);
    console.log(`    ${t.description}`);
    console.log(`    Introduced in: ${t.introducedIn}`);
    if (t.migrationGuideSection) {
      console.log(`    Migration guide: ${t.migrationGuideSection}`);
    }
    console.log();
  }
}
