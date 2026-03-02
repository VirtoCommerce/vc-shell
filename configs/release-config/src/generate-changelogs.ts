import { sync } from "cross-spawn";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import {
  cleanChangelogContent,
  addVersionBumpNotes,
  generateRootChangelog,
} from "@release-config/changelog";
import type { PackageConfig, ChangelogGeneratorOptions } from "@release-config/types";

// Re-export types for backward compatibility (cli-generate-changelogs imports from here)
export type { PackageConfig, ChangelogGeneratorOptions };

/**
 * Generates CHANGELOG.md files from all commits for specified packages.
 * Used for initial one-time changelog bootstrapping via the CLI tool.
 */
export async function generateInitialChangelogs(options: ChangelogGeneratorOptions): Promise<void> {
  const { packages, rootDir = process.cwd(), generateRoot = true, includeRootHeader = true } = options;

  console.log(chalk.cyan("\nGenerating initial CHANGELOG.md files...\n"));

  for (const pkg of packages) {
    const changelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");

    // Create backup if file exists
    if (existsSync(changelogPath)) {
      const backupPath = `${changelogPath}.backup`;
      const content = readFileSync(changelogPath, "utf-8");
      writeFileSync(backupPath, content, "utf-8");
      console.log(chalk.gray(`  Backed up ${changelogPath} to ${backupPath}`));
    }

    console.log(chalk.blue(`\nGenerating changelog for ${pkg.name}...`));

    const result = sync(
      "npx",
      [
        "conventional-changelog",
        "-p",
        "conventionalcommits",
        "-i",
        changelogPath,
        "-s",
        "-r",
        "0",
        "--commit-path",
        path.join(rootDir, pkg.path),
      ],
      { stdio: "inherit", cwd: rootDir },
    );

    if (result.status === 0) {
      if (existsSync(changelogPath)) {
        let content = readFileSync(changelogPath, "utf-8");
        content = cleanChangelogContent(content);
        content = addVersionBumpNotes(content);
        content = content.trim() + "\n";
        writeFileSync(changelogPath, content, "utf-8");
      }
      console.log(chalk.green(`  Generated ${changelogPath}`));
    } else {
      console.log(chalk.red(`  Failed to generate ${changelogPath}`));
    }
  }

  if (generateRoot) {
    await generateRootChangelog({ packages, rootDir, includeRootHeader });
  }

  console.log(chalk.green("\nInitial changelogs generated successfully!"));
  console.log(chalk.cyan("\nNext steps:"));
  console.log(chalk.cyan("  1. Review the generated CHANGELOG.md files"));
  console.log(chalk.cyan("  2. Make any manual adjustments if needed"));
  console.log(chalk.cyan("  3. Commit the changes\n"));
}

// Re-export for backward compatibility
export { generateRootChangelog };
