// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { valid, parse } from "semver";
import { getPackageInfo, args, writePackageJson } from "./utils";
import chalk from "chalk";
import { sync } from "cross-spawn";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Release function that uses Lerna for versioning and changelog generation
 * @param packages - An array of package names to release.
 * @param bumpVersion - A function that takes a package name and version (deprecated, Lerna handles this).
 * @param generateChangelog - A function that generates a changelog for a package with a given version.
 * @param toTag - A function that takes a version and returns a tag name.
 * @param customHooks - A function that takes a package name, version, and workspace name and returns a void or Promise<void>.
 * @returns void
 * @throws Error if there are no packages to release or if the target version is invalid.
 */
export const release = async ({
  packages,
  bumpVersion,
  generateChangelog,
  toTag,
  customHooks,
}: {
  packages: string[];
  /**
   *
   * @param pkgName
   * @param version
   * @param workspaceName
   * @returns
   */
  customHooks?: (version: string) => void | Promise<void>;
  /** @deprecated Lerna handles version bumping automatically */
  bumpVersion?: (pkgName: string, version: string) => void | Promise<void>;
  /** @deprecated Lerna generates changelogs automatically */
  generateChangelog?: (pkgName: string, version: string, workspaceName?: string) => void | Promise<void>;
  /** @deprecated Lerna handles version bumping automatically */
  toTag?: (version: string) => string;
}) => {
  if (packages.length === 0) {
    throw new Error("No packages to release");
  }

  const isDryRun = !!args.dry;

  if (isDryRun) {
    console.log(chalk.yellow("\n⚠️  DRY RUN MODE - No git operations will be performed\n"));
  }

  // Find the correct last tag to compare against
  const { pkg } = getPackageInfo(packages.find((p) => p !== ".") || packages[0]);
  const currentVersion = pkg.version;
  const majorMinor = currentVersion.split(".").slice(0, 2).join(".");

  // Try to find the last tag matching current major.minor version
  const tagResult = sync("git", ["describe", "--tags", "--abbrev=0", "--match", `v${majorMinor}.*`], {
    stdio: "pipe",
    encoding: "utf-8"
  });

  let lastMatchingTag: string | null = null;
  if (tagResult.status === 0 && tagResult.stdout) {
    lastMatchingTag = tagResult.stdout.toString().trim();
    console.log(chalk.gray(`ℹ️  Using ${lastMatchingTag} as reference point for changes\n`));
  } else {
    console.log(chalk.yellow(`⚠️  No matching tag found for v${majorMinor}.*, Lerna will use default behavior\n`));
  }

  // Determine release type
  const { releaseType } = await prompts({
    type: "select",
    name: "releaseType",
    message: "Select release type",
    choices: [
      { title: "Automatic (based on commits)", value: "auto" },
      { title: "Prerelease (alpha/beta/rc)", value: "prerelease" },
      { title: "Graduate prerelease to stable", value: "graduate" },
      { title: "Custom version", value: "custom" },
    ],
  });

  if (!releaseType) {
    console.log(chalk.yellow("\nRelease cancelled\n"));
    return;
  }

  const lernaArgs = ["lerna", "version"];

  // Disable changelog generation by lerna (we generate our own)
  // This also avoids prettier v3 incompatibility with lerna v6
  lernaArgs.push("--no-changelog");

  // Configure lerna command based on release type
  if (releaseType === "auto") {
    // For automatic release, use conventional commits to determine version
    lernaArgs.push("--conventional-commits");
  } else if (releaseType === "prerelease") {
    // Get current version and check if it's already a prerelease
    const { pkg } = getPackageInfo(packages[0]);
    const currentVersion = parse(pkg.version);
    const isCurrentPrerelease = currentVersion && currentVersion.prerelease.length > 0;
    const currentPreid = isCurrentPrerelease ? currentVersion.prerelease[0] : null;

    const { preid } = await prompts({
      type: "select",
      name: "preid",
      message: "Select prerelease identifier",
      choices: [
        {
          title: isCurrentPrerelease && currentPreid === "alpha" ? "alpha (continue)" : "alpha",
          value: "alpha",
        },
        {
          title: isCurrentPrerelease && currentPreid === "beta" ? "beta (continue)" : "beta",
          value: "beta",
        },
        { title: isCurrentPrerelease && currentPreid === "rc" ? "rc (continue)" : "rc", value: "rc" },
      ],
    });

    if (!preid) {
      console.log(chalk.yellow("\nRelease cancelled\n"));
      return;
    }

    // If current version is already a prerelease with the same preid, just increment
    // Otherwise start a new prerelease line
    if (isCurrentPrerelease && currentPreid === preid) {
      lernaArgs.push("prerelease");
    } else {
      lernaArgs.push("prerelease", "--preid", preid);
    }

    // Determine npm tag from preid
    if (!args.tag) {
      args.tag = preid;
    }
  } else if (releaseType === "graduate") {
    lernaArgs.push("--conventional-graduate");
  } else if (releaseType === "custom") {
    const { pkg } = getPackageInfo(packages[0]);
    const { customVersion } = await prompts({
      type: "text",
      name: "customVersion",
      message: "Enter custom version",
      initial: pkg.version,
      validate: (v) => (valid(v) ? true : "Invalid semver version"),
    });

    if (!customVersion) {
      console.log(chalk.yellow("\nRelease cancelled\n"));
      return;
    }

    lernaArgs.push(customVersion);

    // Determine npm tag from version
    const parsed = parse(customVersion);
    if (parsed && parsed.prerelease.length > 0 && !args.tag) {
      const prereleaseId = parsed.prerelease[0];
      if (typeof prereleaseId === "string") {
        args.tag = prereleaseId;
      }
    }
  }

  // Note: npmTag is now automatically determined from git tag in CI
  // No need to ask user for npm tag selection

  // Final confirmation
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: "Ready to release. Continue?",
  });

  if (!yes) {
    console.log(chalk.yellow("\nRelease cancelled\n"));
    return;
  }

  // Add flags for dry-run mode
  if (isDryRun) {
    lernaArgs.push("--no-git-tag-version", "--no-push");
  } else {
    // Always disable Lerna's push - we'll push manually after all changes
    lernaArgs.push("--no-push");
  }

  // Add --force-publish flag if specified
  if (args.force) {
    lernaArgs.push("--force-publish");
    console.log(chalk.yellow("\n⚠️  Force publish mode - all packages will be versioned\n"));
  }

  // Run lerna version
  console.log(chalk.cyan(`\nRunning: npx ${lernaArgs.join(" ")}\n`));
  const result = sync("npx", lernaArgs, { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(chalk.red("\n❌ Release process failed\n"));
    process.exit(result.status || 1);
  }

  // Update root package.json version to match framework (needed for customHooks)
  await updateRootVersion(packages);

  // Execute custom hooks AFTER version bump (e.g. updateBoilerplatePkgVersions, updateAppsDependencies)
  if (customHooks) {
    console.log(chalk.cyan("\nRunning post-version hooks...\n"));
    const { pkg } = getPackageInfo(packages[0] === "." ? packages[1] : packages[0]);
    await customHooks(pkg.version); // Pass new version for custom logic
  }

  // Update yarn.lock to reflect new package versions
  console.log(chalk.cyan("\nUpdating yarn.lock with new package versions...\n"));
  const yarnResult = sync("yarn", ["install"], { stdio: "inherit" });
  if (yarnResult.status !== 0) {
    console.error(chalk.red("\n❌ Failed to update yarn.lock\n"));
    process.exit(yarnResult.status || 1);
  }

  // Enhance changelogs for packages without changes
  await enhanceChangelogs(packages);

  // Generate root CHANGELOG with package grouping
  await generateRootChangelog(packages);

  // Note: npmTag is now determined from git tag in CI, no need to update package.json

  // Commit changes only if NOT dry-run
  if (!isDryRun) {
    const gitStatus = sync("git", ["status", "--porcelain"], { stdio: "pipe" });
    if (gitStatus.stdout?.toString().trim()) {
      const lastTag = sync("git", ["describe", "--tags", "--abbrev=0"], { stdio: "pipe" });
      const tag = lastTag.stdout?.toString().trim() || "HEAD";

      sync("git", ["add", "-A"], { stdio: "inherit" });
      sync("git", ["commit", "--amend", "--no-edit", "--no-verify"], { stdio: "inherit" });
      sync("git", ["tag", "-f", tag], { stdio: "inherit" });

      // Push updated commit and tag to remote
      console.log(chalk.cyan("\nPushing changes to remote...\n"));
      sync("git", ["push", "origin", "HEAD", "--force-with-lease"], { stdio: "inherit" });
      sync("git", ["push", "origin", tag, "--force"], { stdio: "inherit" });

      console.log(chalk.green("\n✅ Updated changelogs, package.json, and pushed to remote\n"));
    }
  }

  if (isDryRun) {
    console.log(chalk.yellow("\n✅ Dry run completed successfully!\n"));
    console.log(chalk.cyan("Changes made:"));
    console.log(chalk.cyan("  - Updated package versions"));
    console.log(chalk.cyan("  - Generated/updated CHANGELOG.md files"));
    console.log(chalk.cyan("  - npmTag will be determined from git tag in CI"));
    console.log(chalk.cyan("  - Updated yarn.lock with new package versions\n"));
    console.log(chalk.yellow("No git operations performed. Review changes with:"));
    console.log(chalk.cyan("  git diff\n"));
    console.log(chalk.yellow("To revert all changes:"));
    console.log(chalk.cyan("  git checkout -- .\n"));
  } else {
    console.log(chalk.green("\n✅ Release completed successfully!\n"));

    console.log(chalk.cyan(`\nℹ️  npmTag will be automatically determined from git tag in CI`));
    console.log(chalk.cyan(`   GitHub Actions will publish with the correct tag based on the git tag\n`));
  }
};

/**
 * Cleans up changelogs and adds "Version bump only" for empty versions
 */
async function enhanceChangelogs(packages: string[]) {
  console.log(chalk.cyan("\nEnhancing changelogs...\n"));

  for (const pkgPath of packages) {
    if (pkgPath === ".") continue; // Skip root

    const changelogPath = path.join(pkgPath, "CHANGELOG.md");

    if (!existsSync(changelogPath)) continue;

    // Read existing changelog
    let content = readFileSync(changelogPath, "utf-8");

    // Remove ALL unwanted headers and text generated by Lerna
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
      '$1\n**Note:** Version bump only for package\n\n$2'
    );

    // Clean up
    content = content.trim() + "\n";

    // Write cleaned content
    writeFileSync(changelogPath, content, "utf-8");
  }
}

/**
 * Updates root package.json version to match framework packages
 */
async function updateRootVersion(packages: string[]) {
  // Get version from first package (all have same version in fixed mode)
  const firstPkg = packages.find((p) => p !== ".");
  if (!firstPkg) return;

  const { pkg } = getPackageInfo(firstPkg);
  const newVersion = pkg.version;

  // Update root package.json
  const rootPkgPath = "package.json";
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));

  if (rootPkg.version !== newVersion) {
    rootPkg.version = newVersion;
    writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n", "utf-8");
    console.log(chalk.gray(`  Updated root package.json version: ${newVersion}`));
  }
}

/**
 * Generates root CHANGELOG with package grouping
 */
async function generateRootChangelog(packages: string[]) {
  console.log(chalk.cyan("\nGenerating root CHANGELOG with package grouping...\n"));

  const rootChangelogPath = "CHANGELOG.md";

  // Package display names mapping
  const packageDisplayNames: Record<string, string> = {
    framework: "VC-Shell Framework (@vc-shell/framework)",
    "cli/api-client": "API Client Generator (@vc-shell/api-client-generator)",
    "cli/create-vc-app": "Create VC App (@vc-shell/create-vc-app)",
    "configs/release-config": "Release Config (@vc-shell/release-config)",
    "configs/vite-config": "Vite Config (@vc-shell/config-generator)",
    "configs/ts-config": "TypeScript Config (@vc-shell/ts-config)",
  };

  // Collect versions and changes from package changelogs
  const versionChanges: Record<string, Record<string, string>> = {};
  const versionHeaders: Record<string, string> = {}; // Store original version headers

  for (const pkgPath of packages) {
    if (pkgPath === ".") continue;

    const pkgChangelogPath = path.join(pkgPath, "CHANGELOG.md");
    const displayName = packageDisplayNames[pkgPath] || pkgPath;

    if (!existsSync(pkgChangelogPath)) continue;

    const content = readFileSync(pkgChangelogPath, "utf-8");
    const lines = content.split("\n");
    let currentVersion: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check version header (supports both ## 1.2.3 and ## [1.2.3])
      const versionMatch = line.match(/^##\s+(?:\[)?([\d.a-z-]+)(?:\])?(?:\s+\([^)]+\))?/i);

      if (versionMatch) {
        // Save previous version
        if (currentVersion && currentContent.length > 0) {
          const contentStr = currentContent.join("\n").trim();
          if (!versionChanges[currentVersion]) {
            versionChanges[currentVersion] = {};
          }
          versionChanges[currentVersion][displayName] = contentStr;
        }

        // Start new version
        currentVersion = versionMatch[1];
        currentContent = [];

        // Store the full original header (first one wins, they should all be the same)
        if (!versionHeaders[currentVersion]) {
          versionHeaders[currentVersion] = line.replace(/^##\s+/, ""); // Remove "## " prefix
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
      versionChanges[currentVersion][displayName] = contentStr;
    }
  }

  // Build root changelog (no header - filename is self-documenting)
  let rootContent = "";

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
      rootContent += `**Note:** Version bump only for package\n\n`;
      continue;
    }

    // Add changes grouped by package (only packages with real changes)
    let addedAnyPackage = false;
    for (const pkgPath of packages) {
      if (pkgPath === ".") continue;
      const displayName = packageDisplayNames[pkgPath] || pkgPath;
      const pkgContent = changes[displayName];

      if (pkgContent && pkgContent.trim()) {
        // Check if package has real changes (not just "Version bump only")
        const withoutNotes = pkgContent.replace(/\*\*Note:\*\*\s+Version bump only[^\n]*/gi, "").trim();
        if (withoutNotes.length > 0) {
          addedAnyPackage = true;
          rootContent += `### ${displayName}\n\n`;
          rootContent += `${pkgContent}\n\n`;
        }
      }
    }

    // This should not happen if hasRealChanges is true, but just in case
    if (!addedAnyPackage) {
      rootContent += `**Note:** Version bump only for package\n\n`;
    }
  }

  // Clean up extra empty lines
  rootContent = rootContent.replace(/\n{3,}/g, "\n\n");

  writeFileSync(rootChangelogPath, rootContent, "utf-8");
  console.log(chalk.green("  ✓ Generated root CHANGELOG.md with package grouping"));
}

