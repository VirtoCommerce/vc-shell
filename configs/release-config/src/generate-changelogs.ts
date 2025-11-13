import { sync } from "cross-spawn";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";

export interface PackageConfig {
  name: string;
  path: string;
  displayName: string;
}

export interface ChangelogGeneratorOptions {
  packages: PackageConfig[];
  rootDir?: string;
  generateRoot?: boolean;
  includeRootHeader?: boolean;
}

/**
 * Generates CHANGELOG.md files from all commits for specified packages
 * @param options - Configuration options for changelog generation
 */
export async function generateInitialChangelogs(options: ChangelogGeneratorOptions): Promise<void> {
  const { packages, rootDir = process.cwd(), generateRoot = true, includeRootHeader = true } = options;

  console.log(chalk.cyan("\n🚀 Generating initial CHANGELOG.md files...\n"));

  // First generate changelog for each package separately
  for (const pkg of packages) {
    const changelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");

    // Create backup if file exists
    if (existsSync(changelogPath)) {
      const backupPath = `${changelogPath}.backup`;
      const content = readFileSync(changelogPath, "utf-8");
      writeFileSync(backupPath, content, "utf-8");
      console.log(chalk.gray(`  📦 Backed up ${changelogPath} to ${backupPath}`));
    }

    // Generate changelog from all commits
    console.log(chalk.blue(`\n📝 Generating changelog for ${pkg.name}...`));

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
        "0", // 0 = all commits
        "--commit-path",
        path.join(rootDir, pkg.path),
      ],
      { stdio: "inherit", cwd: rootDir },
    );

    if (result.status === 0) {
      // Clean up and improve generated file
      if (existsSync(changelogPath)) {
        let content = readFileSync(changelogPath, "utf-8");

        // Remove all unwanted headers and text
        content = content.replace(/^# CHANGELOG\s*\n/gm, "");
        content = content.replace(/^# Change Log\s*\n/gm, "");
        content = content.replace(/^All notable changes to this (project|package) will be documented in this file\.\s*\n/gm, "");
        content = content.replace(
          /^See \[Conventional Commits\]\(https:\/\/conventionalcommits\.org\) for commit guidelines\.\s*\n/gm,
          "",
        );
        content = content.replace(/\n{3,}/g, "\n\n");

        // Add "Version bump only" for empty versions
        content = content.replace(
          /^(##\s+\[[^\]]+\][^\n]*\n)\n(##\s+\[|$)/gm,
          '$1\n**Note:** Version bump only\n\n$2'
        );

        // Clean up
        content = content.trim() + "\n";

        writeFileSync(changelogPath, content, "utf-8");
      }

      console.log(chalk.green(`  ✓ Generated ${changelogPath}`));
    } else {
      console.log(chalk.red(`  ✗ Failed to generate ${changelogPath}`));
    }
  }

  // After generating all package changelogs - generate root with grouping
  if (generateRoot) {
    await generateRootChangelog({ packages, rootDir, includeRootHeader });
  }

  console.log(chalk.green("\n✅ Initial changelogs generated successfully!"));
  console.log(chalk.cyan("\n📋 Next steps:"));
  console.log(chalk.cyan("  1. Review the generated CHANGELOG.md files"));
  console.log(chalk.cyan("  2. Make any manual adjustments if needed"));
  console.log(chalk.cyan("  3. Commit the changes\n"));
}

interface RootChangelogOptions {
  packages: PackageConfig[];
  rootDir?: string;
  includeRootHeader?: boolean;
}

/**
 * Generates consolidated root CHANGELOG.md from package changelogs
 */
export async function generateRootChangelog(options: RootChangelogOptions): Promise<void> {
  const { packages, rootDir = process.cwd(), includeRootHeader = true } = options;

  console.log(chalk.blue("\n📝 Generating consolidated root changelog..."));

  const rootChangelogPath = path.join(rootDir, "CHANGELOG.md");

  // Create backup if file exists
  if (existsSync(rootChangelogPath)) {
    const backupPath = `${rootChangelogPath}.backup`;
    const content = readFileSync(rootChangelogPath, "utf-8");
    writeFileSync(backupPath, content, "utf-8");
    console.log(chalk.gray(`  📦 Backed up ${rootChangelogPath} to ${backupPath}`));
  }

  // Collect versions and changes from already generated package changelogs
  const versionChanges: Record<string, Record<string, string>> = {};
  const versionHeaders: Record<string, string> = {};

  for (const pkg of packages) {
    const pkgChangelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");

    console.log(chalk.gray(`  📖 Collecting changes from ${pkg.name}...`));

    if (existsSync(pkgChangelogPath)) {
      const content = readFileSync(pkgChangelogPath, "utf-8");

      // Parse versions and their content
      const lines = content.split("\n");
      let currentVersion: string | null = null;
      let currentContent: string[] = [];

      for (const line of lines) {
        // Check version header (supports both ## 1.2.3 and ## [1.2.3])
        const versionMatch = line.match(/^##\s+(?:\[)?([\d.a-z-]+)(?:\])?(?:\s+\([^)]+\))?/i);

        if (versionMatch) {
          // Save previous version if exists
          if (currentVersion && currentContent.length > 0) {
            const contentStr = currentContent.join("\n").trim();
            if (!versionChanges[currentVersion]) {
              versionChanges[currentVersion] = {};
            }
            versionChanges[currentVersion][pkg.displayName] = contentStr;
          }

          // Start new version
          currentVersion = versionMatch[1];
          currentContent = [];

          // Store the full original header (first one wins)
          if (!versionHeaders[currentVersion]) {
            versionHeaders[currentVersion] = line.replace(/^##\s+/, "");
          }
        } else if (currentVersion && line.trim() !== "") {
          // Add content (skip file headers and auto-generated text)
          if (
            !line.startsWith("# CHANGELOG") &&
            !line.startsWith("# Change Log") &&
            !line.startsWith("All notable changes") &&
            !line.startsWith("See [Conventional Commits]")
          ) {
            currentContent.push(line);
          }
        }
      }

      // Save last version
      if (currentVersion && currentContent.length > 0) {
        const contentStr = currentContent.join("\n").trim();
        if (!versionChanges[currentVersion]) {
          versionChanges[currentVersion] = {};
        }
        versionChanges[currentVersion][pkg.displayName] = contentStr;
      }
    }
  }

  // Build root changelog
  let rootContent = "";

  // Add header if requested
  if (includeRootHeader) {
    rootContent = `# CHANGELOG\n\nAll notable changes to this monorepo will be documented in this file.\n\n`;
  }

  // Sort versions (newest first)
  const allVersions = Object.keys(versionChanges).sort((a, b) => {
    const aParts = a.split(/[.-]/).map((x) => (isNaN(parseInt(x)) ? x : parseInt(x)));
    const bParts = b.split(/[.-]/).map((x) => (isNaN(parseInt(x)) ? x : parseInt(x)));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;

      if (aVal !== bVal) {
        if (typeof aVal === "number" && typeof bVal === "number") {
          return bVal - aVal;
        }
        return String(bVal).localeCompare(String(aVal));
      }
    }
    return 0;
  });

  // Build content for each version
  for (const version of allVersions) {
    const changes = versionChanges[version];

    // Check if version has real changes (not just "Version bump only")
    const hasRealChanges = Object.values(changes).some((content) => {
      if (!content || !content.trim()) return false;
      // Exclude "Version bump only" notes
      const withoutNotes = content.replace(/\*\*Note:\*\*\s+Version bump only[^\n]*/gi, "").trim();
      return withoutNotes.length > 0;
    });

    // Use the original header from package changelogs (with links and dates)
    const versionHeader = versionHeaders[version] || version;
    rootContent += `## ${versionHeader}\n\n`;

    if (!hasRealChanges) {
      rootContent += `**Note:** Version bump only\n\n`;
      continue;
    }

    // Add changes grouped by package (only packages with real changes)
    let addedAnyPackage = false;
    for (const pkg of packages) {
      const pkgContent = changes[pkg.displayName];

      if (pkgContent && pkgContent.trim()) {
        // Check if package has real changes (not just "Version bump only")
        const withoutNotes = pkgContent.replace(/\*\*Note:\*\*\s+Version bump only[^\n]*/gi, "").trim();
        if (withoutNotes.length > 0) {
          addedAnyPackage = true;
          rootContent += `### ${pkg.displayName}\n\n`;
          rootContent += `${pkgContent}\n\n`;
        }
      }
    }

    // If no content after all - add placeholder
    if (!addedAnyPackage) {
      rootContent += `**Note:** Version bump only\n\n`;
    }
  }

  // Clean up extra empty lines
  rootContent = rootContent.replace(/\n{3,}/g, "\n\n");
  rootContent = rootContent.trim() + "\n";

  writeFileSync(rootChangelogPath, rootContent, "utf-8");
  console.log(chalk.green(`  ✓ Generated ${rootChangelogPath} with package grouping`));
}
