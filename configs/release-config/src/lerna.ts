import { sync } from "cross-spawn";
import chalk from "chalk";
import { getPackageInfo } from "@release-config/utils";
import type { PackageConfig } from "@release-config/types";

export interface LernaVersionOptions {
  tagVersionPrefix: string;
  isDryRun: boolean;
  forcePublish: boolean;
}

/**
 * Builds lerna version CLI arguments from the release type and options.
 */
export function buildLernaVersionArgs(
  releaseTypeArgs: string[],
  options: LernaVersionOptions,
): string[] {
  const args = ["lerna", "version", ...releaseTypeArgs];

  // Always generate changelogs from conventional commits
  args.push("--conventional-commits");

  // Critical: tell Lerna which tag prefix to use (prevents cross-project tag conflicts)
  args.push("--tag-version-prefix", options.tagVersionPrefix);

  // Always disable Lerna's push — we push manually after changelog enhancement
  args.push("--no-push");

  if (options.isDryRun) {
    args.push("--no-git-tag-version");
  }

  if (options.forcePublish) {
    args.push("--force-publish");
    console.log(chalk.yellow("\nForce publish mode - all packages will be versioned\n"));
  }

  return args;
}

/**
 * Runs `npx lerna version` with the given arguments.
 * Exits the process on failure.
 */
export function runLernaVersion(args: string[]): void {
  console.log(chalk.cyan(`\nRunning: npx ${args.join(" ")}\n`));
  const result = sync("npx", args, { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(chalk.red("\nRelease process failed\n"));
    process.exit(result.status || 1);
  }
}

/**
 * Captures current versions of all packages before lerna runs.
 */
export function captureVersionsBefore(packages: PackageConfig[]): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const pkg of packages) {
    const { pkg: pkgJson } = getPackageInfo(pkg.path);
    versions[pkg.path] = pkgJson.version;
  }
  return versions;
}

/**
 * Checks whether any package version changed compared to the snapshot.
 * Returns the new version string if changed, or null if nothing changed.
 */
export function getNewVersionIfChanged(
  packages: PackageConfig[],
  versionsBefore: Record<string, string>,
): string | null {
  for (const pkg of packages) {
    const { pkg: pkgJson } = getPackageInfo(pkg.path);
    if (pkgJson.version !== versionsBefore[pkg.path]) {
      return pkgJson.version;
    }
  }
  return null;
}

/**
 * Logs diagnostic information to help debug version-skip issues.
 */
export function logDiagnostics(tagPrefix: string, majorMinor: string, lastTag: string | null): void {
  console.log(chalk.gray("\n--- Release diagnostics ---"));
  console.log(chalk.gray(`  tagVersionPrefix: "${tagPrefix}"`));
  console.log(chalk.gray(`  looking for tags: ${tagPrefix}${majorMinor}.*`));

  if (lastTag) {
    // Count commits since last tag
    const countResult = sync("git", ["rev-list", "--count", `${lastTag}..HEAD`], {
      stdio: "pipe",
      encoding: "utf-8",
    });
    const commitCount = countResult.status === 0 ? countResult.stdout.trim() : "?";

    // Check for conventional commits
    const logResult = sync(
      "git",
      ["log", `${lastTag}..HEAD`, "--oneline", "--grep", "^feat\\|^fix\\|^perf\\|^revert"],
      { stdio: "pipe", encoding: "utf-8" },
    );
    const conventionalCount =
      logResult.status === 0 ? logResult.stdout.trim().split("\n").filter(Boolean).length : 0;

    console.log(chalk.gray(`  last matching tag: ${lastTag}`));
    console.log(chalk.gray(`  commits since tag: ${commitCount}`));
    console.log(chalk.gray(`  conventional commits: ${conventionalCount}`));

    if (conventionalCount === 0 && parseInt(commitCount) > 0) {
      console.log(
        chalk.yellow(
          `  No conventional commits found. Use --force to publish anyway.`,
        ),
      );
    }
  } else {
    console.log(chalk.yellow(`  No matching tag found — Lerna will use default behavior`));
  }
  console.log(chalk.gray("---------------------------\n"));
}
