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
  customHooks: (version: string) => void | Promise<void>;
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

  const lernaArgs = ["lerna", "version", "--conventional-commits"];

  // Configure lerna command based on release type
  if (releaseType === "prerelease") {
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

  // Ask about npm tag if not determined
  if (!args.tag) {
    const { npmTag } = await prompts({
      type: "select",
      name: "npmTag",
      message: "Select npm distribution tag",
      choices: [
        { title: "latest (default)", value: "latest" },
        { title: "next", value: "next" },
        { title: "beta", value: "beta" },
        { title: "alpha", value: "alpha" },
        { title: "custom", value: "custom" },
      ],
    });

    if (npmTag === "custom") {
      const res = await prompts({
        type: "text",
        name: "customTag",
        message: "Input custom npm tag",
        initial: "latest",
      });
      args.tag = res.customTag;
    } else if (npmTag !== "latest") {
      args.tag = npmTag;
    }
  }

  // Final confirmation
  const { yes } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Ready to release${args.tag && args.tag !== "latest" ? ` with npm tag ${chalk.blue(args.tag)}` : ""}. Continue?`,
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

  // Enhance changelogs for packages without changes
  await enhanceChangelogs(packages);

  // Generate root CHANGELOG with package grouping
  await generateRootChangelog(packages);

  // Update npmTag in package.json if needed
  await updateNpmTags(packages);

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
    console.log(chalk.cyan("  - Updated npmTag fields in package.json\n"));
    console.log(chalk.yellow("No git operations performed. Review changes with:"));
    console.log(chalk.cyan("  git diff\n"));
    console.log(chalk.yellow("To revert all changes:"));
    console.log(chalk.cyan("  git checkout -- .\n"));
  } else {
    console.log(chalk.green("\n✅ Release completed successfully!\n"));

    if (args.tag && args.tag !== "latest") {
      console.log(chalk.cyan(`\nℹ️  Package files updated with npmTag: ${chalk.blue(args.tag)}`));
      console.log(chalk.cyan(`   GitHub Actions will automatically publish with this tag\n`));
    }
  }
};

/**
 * Enhances changelogs for packages without changes and cleans up generated files
 */
async function enhanceChangelogs(packages: string[]) {
  console.log(chalk.cyan("\nEnhancing changelogs...\n"));

  // Get list of changed packages from Lerna
  const changedResult = sync("npx", ["lerna", "changed", "--json"], { stdio: "pipe" });
  const changedPackages = new Set<string>();

  if (changedResult.stdout) {
    try {
      const changed = JSON.parse(changedResult.stdout.toString());
      changed.forEach((p: { name: string }) => changedPackages.add(p.name));
    } catch {
      // If parsing error, consider all packages as changed
    }
  }

  for (const pkgPath of packages) {
    if (pkgPath === ".") continue; // Skip root

    const changelogPath = path.join(pkgPath, "CHANGELOG.md");
    const { pkg } = getPackageInfo(pkgPath);
    const hasChanges = changedPackages.has(pkg.name);

    // If file doesn't exist, create it
    if (!existsSync(changelogPath)) {
      const initialContent = `# CHANGELOG\n\nAll notable changes to this package will be documented in this file.\n\n## [${pkg.version}] (${new Date().toISOString().split("T")[0]})\n\n**Note:** Version bump only - Updated dependencies to match framework version\n`;
      writeFileSync(changelogPath, initialContent, "utf-8");
      console.log(chalk.gray(`  Created changelog for ${pkg.name}`));
      continue;
    }

    // Read existing changelog
    let content = readFileSync(changelogPath, "utf-8");

    // Improve changelog formatting
    content = content.replace(/^# Change Log\s*\n/gm, ""); // Remove duplicate "Change Log" headers
    content = content.replace(/^All notable changes to this project will be documented in this file\.\s*\n/gm, "");
    content = content.replace(
      /^See \[Conventional Commits\]\(https:\/\/conventionalcommits\.org\) for commit guidelines\.\s*\n/gm,
      "",
    );
    content = content.replace(/\n{3,}/g, "\n\n"); // Remove multiple empty lines

    // Check packages without changes and add "Version bump only" for empty versions
    const lines = content.split("\n");
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check version header (support both formats: with [] and without)
      const versionMatch = line.match(/^##\s+(\[)?([\d.a-z-]+)(\])?(\s+\([^)]+\))?/i);

      if (versionMatch) {
        const versionNumber = versionMatch[2];
        const isCurrentVersion = versionNumber === pkg.version;

        result.push(line);
        i++;

        // Skip empty lines after header
        while (i < lines.length && lines[i].trim() === "") {
          result.push(lines[i]);
          i++;
        }

        // Check if there's content before next version
        let hasContent = false;
        let contentStart = i;
        let j = i;

        while (j < lines.length && !lines[j].match(/^##\s+(\[)?[\d.a-z-]+(\])?/i)) {
          const trimmed = lines[j].trim();
          // Ignore empty lines and existing "Note:" messages
          if (trimmed !== "" && !trimmed.startsWith("**Note:**")) {
            hasContent = true;
            break;
          }
          j++;
        }

        // If this is current version without changes OR old empty version
        if (!hasContent) {
          // Check if "Note:" message already exists
          const nextFewLines = lines.slice(contentStart, Math.min(contentStart + 5, lines.length));
          const alreadyHasNote = nextFewLines.some((l) => l.includes("**Note:**"));

          if (!alreadyHasNote) {
            if (isCurrentVersion && !hasChanges) {
              result.push("**Note:** Version bump only - Updated dependencies to match framework version");
            } else {
              result.push("**Note:** Version bump only for package");
            }
            result.push("");
          }
        }
      } else {
        result.push(line);
        i++;
      }
    }

    content = result.join("\n");

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
      } else if (currentVersion && line.trim() !== "") {
        // Add content (skip file headers)
        if (
          !line.startsWith("# CHANGELOG") &&
          !line.startsWith("# Change Log") &&
          !line.startsWith("All notable changes")
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

  // Build root changelog
  let rootContent = `# CHANGELOG

All notable changes to this monorepo will be documented in this file.

`;

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
    const hasAnyChanges = Object.values(changes).some((content) => content && content.trim().length > 0);

    rootContent += `## ${version}\n\n`;

    if (!hasAnyChanges) {
      rootContent += `**Note:** Version bump only for package\n\n`;
      continue;
    }

    // Add changes grouped by package
    let versionHasContent = false;
    for (const pkgPath of packages) {
      if (pkgPath === ".") continue;
      const displayName = packageDisplayNames[pkgPath] || pkgPath;
      const pkgContent = changes[displayName];

      if (pkgContent && pkgContent.trim()) {
        versionHasContent = true;
        rootContent += `### ${displayName}\n\n`;
        rootContent += `${pkgContent}\n\n`;
      }
    }

    if (!versionHasContent) {
      rootContent += `**Note:** Version bump only for package\n\n`;
    }
  }

  // Clean up extra empty lines
  rootContent = rootContent.replace(/\n{3,}/g, "\n\n");

  writeFileSync(rootChangelogPath, rootContent, "utf-8");
  console.log(chalk.green("  ✓ Generated root CHANGELOG.md with package grouping"));
}

/**
 * Updates npmTag field in package.json files
 */
async function updateNpmTags(packages: string[]) {
  if (!args.tag) return;

  for (const pkgPath of packages) {
    if (pkgPath === ".") continue;

    const { pkg, pkgPath: jsonPath } = getPackageInfo(pkgPath);
    const pkgData: Record<string, unknown> = { ...pkg };

    if (args.tag !== "latest") {
      pkgData.npmTag = args.tag;
      await writePackageJson(jsonPath, pkgData);
    } else if (pkgData.npmTag) {
      delete pkgData.npmTag;
      await writePackageJson(jsonPath, pkgData);
    }
  }
}
