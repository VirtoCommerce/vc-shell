import { sync } from "cross-spawn";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";

/**
 * Generates complete CHANGELOG.md files from all commits for each package
 * Used for initial changelog initialization when migrating to the new system
 */

const packages = [
  { name: "framework", path: "framework", displayName: "Framework (@vc-shell/framework)" },
  {
    name: "cli/api-client",
    path: "cli/api-client",
    displayName: "API Client Generator (@vc-shell/api-client-generator)",
  },
  { name: "cli/create-vc-app", path: "cli/create-vc-app", displayName: "Create VC App (@vc-shell/create-vc-app)" },
  {
    name: "configs/release-config",
    path: "configs/release-config",
    displayName: "Release Config (@vc-shell/release-config)",
  },
  { name: "configs/vite-config", path: "configs/vite-config", displayName: "Vite Config (@vc-shell/vite-config)" },
  { name: "configs/ts-config", path: "configs/ts-config", displayName: "TypeScript Config (@vc-shell/ts-config)" },
];

async function generateRootChangelog() {
  console.log(chalk.blue("\n  Generating consolidated root changelog..."));

  const rootChangelogPath = "CHANGELOG.md";

  // Create backup if file exists
  if (existsSync(rootChangelogPath)) {
    const backupPath = `${rootChangelogPath}.backup`;
    const content = readFileSync(rootChangelogPath, "utf-8");
    writeFileSync(backupPath, content, "utf-8");
    console.log(chalk.gray(`  📦 Backed up ${rootChangelogPath} to ${backupPath}`));
  }

  // Collect versions and changes from already generated package changelogs
  const versionChanges: Record<string, Record<string, string>> = {};

  for (const pkg of packages) {
    const pkgChangelogPath = path.join(pkg.path, "CHANGELOG.md");

    console.log(chalk.gray(`  Collecting changes from ${pkg.name}...`));

    if (existsSync(pkgChangelogPath)) {
      const content = readFileSync(pkgChangelogPath, "utf-8");

      // Parse versions and their content
      // Look for ## version, then capture all content until next ## version
      const lines = content.split("\n");
      let currentVersion: string | null = null;
      let currentContent: string[] = [];

      for (const line of lines) {
        // Check version header
        const versionMatch = line.match(/^##\s+(?:\[)?([\d.a-z-]+)(?:\])?(?:\s+\([^)]+\))?/i);

        if (versionMatch) {
          // Save previous version if exists
          if (currentVersion) {
            const content = currentContent.join("\n").trim();
            if (!versionChanges[currentVersion]) {
              versionChanges[currentVersion] = {};
            }
            versionChanges[currentVersion][pkg.displayName] = content;
          }

          // Start new version
          currentVersion = versionMatch[1];
          currentContent = [];
        } else if (currentVersion && line.trim() !== "") {
          // Add content to current version (skip file header)
          if (!line.startsWith("# CHANGELOG") && !line.startsWith("All notable changes")) {
            currentContent.push(line);
          }
        }
      }

      // Save last version
      if (currentVersion && currentContent.length > 0) {
        const content = currentContent.join("\n").trim();
        if (!versionChanges[currentVersion]) {
          versionChanges[currentVersion] = {};
        }
        versionChanges[currentVersion][pkg.displayName] = content;
      }
    }
  }

  // Build final changelog
  let rootContent = `# CHANGELOG

All notable changes to this monorepo will be documented in this file.

`;

  // Get and sort all versions
  const allVersions = Object.keys(versionChanges).sort((a, b) => {
    const aParts = a.split(/[.-]/).map((x) => (isNaN(parseInt(x)) ? x : parseInt(x)));
    const bParts = b.split(/[.-]/).map((x) => (isNaN(parseInt(x)) ? x : parseInt(x)));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;

      if (aVal !== bVal) {
        if (typeof aVal === "number" && typeof bVal === "number") {
          return bVal - aVal; // Reverse sort (newest versions first)
        }
        return String(bVal).localeCompare(String(aVal));
      }
    }
    return 0;
  });

  // Build content for each version
  for (const version of allVersions) {
    const changes = versionChanges[version];

    // Check if there are changes in at least one package
    const hasAnyChanges = Object.values(changes).some((content) => content && content.trim().length > 0);

    rootContent += `## ${version}\n\n`;

    if (!hasAnyChanges) {
      rootContent += `**Note:** Version bump only for package\n\n`;
      continue;
    }

    // Add changes by package
    let versionHasContent = false;
    for (const pkg of packages) {
      const pkgContent = changes[pkg.displayName];

      if (pkgContent && pkgContent.trim()) {
        versionHasContent = true;
        rootContent += `### ${pkg.displayName}\n\n`;
        rootContent += `${pkgContent}\n\n`;
      }
    }

    // If no content after all - add placeholder
    if (!versionHasContent) {
      rootContent += `**Note:** Version bump only for package\n\n`;
    }
  }

  // Remove extra empty lines
  rootContent = rootContent.replace(/\n{3,}/g, "\n\n");

  writeFileSync(rootChangelogPath, rootContent, "utf-8");
  console.log(chalk.green(`  ✓ Generated ${rootChangelogPath} with package grouping`));
}

async function generateInitialChangelogs() {
  console.log(chalk.cyan("\n🔄 Generating initial CHANGELOG.md files from all commits...\n"));

  // First generate changelog for each package separately
  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");

    // Create backup if file exists
    if (existsSync(changelogPath)) {
      const backupPath = `${changelogPath}.backup`;
      const content = readFileSync(changelogPath, "utf-8");
      writeFileSync(backupPath, content, "utf-8");
      console.log(chalk.gray(`  📦 Backed up ${changelogPath} to ${backupPath}`));
    }

    // Generate changelog from all commits
    console.log(chalk.blue(`\n  Generating changelog for ${pkg.name}...`));

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
        pkg.path,
      ],
      { stdio: "inherit", cwd: process.cwd() },
    );

    if (result.status === 0) {
      // Clean up and improve generated file
      if (existsSync(changelogPath)) {
        let content = readFileSync(changelogPath, "utf-8");

        // Replace header with description
        const header = `# CHANGELOG

All notable changes to this package will be documented in this file.

`;
        content = content.replace(/^#\s+[^\n]+\n+/i, header);

        // Remove standard lines
        content = content.replace(/^All notable changes to this project will be documented in this file\.\s*\n/gm, "");
        content = content.replace(
          /^See \[Conventional Commits\]\(https:\/\/conventionalcommits\.org\) for commit guidelines\.\s*\n/gm,
          "",
        );
        content = content.replace(/\n{3,}/g, "\n\n");

        // Add "Version bump only" for empty versions
        // Process each version separately
        const lines = content.split("\n");
        const result: string[] = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];

          // Check version header (with or without square brackets)
          if (line.match(/^##\s+(\[)?[\d.a-z-]+(\])?/i)) {
            result.push(line);
            i++;

            // Skip empty lines after header
            while (i < lines.length && lines[i].trim() === "") {
              result.push(lines[i]);
              i++;
            }

            // Check if there's content before next version
            let hasContent = false;
            let j = i;

            while (j < lines.length && !lines[j].match(/^##\s+(\[)?[\d.a-z-]+(\])?/i)) {
              if (lines[j].trim() !== "") {
                hasContent = true;
                break;
              }
              j++;
            }

            // If no content - add "Version bump only"
            if (!hasContent) {
              result.push("**Note:** Version bump only for package");
              result.push("");
            }
          } else {
            result.push(line);
            i++;
          }
        }

        content = result.join("\n");

        writeFileSync(changelogPath, content, "utf-8");
      }

      console.log(chalk.green(`  ✓ Generated ${changelogPath}`));
    } else {
      console.log(chalk.red(`  ✗ Failed to generate ${changelogPath}`));
    }
  }

  // After generating all package changelogs - generate root with grouping
  await generateRootChangelog();

  console.log(chalk.green("\n✅ Initial changelogs generated successfully!"));
  console.log(chalk.cyan("\nNext steps:"));
  console.log(chalk.cyan("  1. Review the generated CHANGELOG.md files"));
  console.log(chalk.cyan("  2. Make any manual adjustments if needed"));
  console.log(chalk.cyan("  3. Commit the changes\n"));
}

generateInitialChangelogs().catch((error) => {
  console.error(chalk.red("\n❌ Error generating changelogs:"), error);
  process.exit(1);
});
