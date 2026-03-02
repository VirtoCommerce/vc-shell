import { sync } from "cross-spawn";
import { existsSync } from "node:fs";
import chalk from "chalk";
import type { PackageConfig } from "@release-config/types";

/**
 * Finds the last git tag matching `<prefix><majorMinor>.*`.
 * Returns the tag string or null if none found.
 */
export function findLastMatchingTag(majorMinor: string, tagPrefix: string): string | null {
  const result = sync("git", ["describe", "--tags", "--abbrev=0", "--match", `${tagPrefix}${majorMinor}.*`], {
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

/**
 * Gets the latest tag on current HEAD (created by Lerna).
 */
export function getLatestTag(): string | null {
  const result = sync("git", ["describe", "--tags", "--abbrev=0"], {
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

/**
 * Returns paths that should be staged after post-lerna modifications.
 * Replaces the unsafe `git add -A` with targeted file staging.
 */
export function getReleaseStagePaths(packages: PackageConfig[]): string[] {
  const paths = ["package.json", "yarn.lock", "CHANGELOG.md"];
  for (const pkg of packages) {
    paths.push(`${pkg.path}/package.json`);
    paths.push(`${pkg.path}/CHANGELOG.md`);
  }
  return paths.filter((p) => existsSync(p));
}

/**
 * Stages specified paths and amends the last commit (created by Lerna).
 * Exits on failure.
 */
export function stageAndAmendCommit(paths: string[]): void {
  const addResult = sync("git", ["add", ...paths], { stdio: "inherit" });
  if (addResult.status !== 0) {
    console.error(chalk.red("\nFailed to stage changes\n"));
    process.exit(1);
  }

  const commitResult = sync("git", ["commit", "--amend", "--no-edit"], { stdio: "inherit" });
  if (commitResult.status !== 0) {
    console.error(chalk.red("\nFailed to amend commit\n"));
    process.exit(1);
  }
}

/**
 * Deletes and recreates the tag as an annotated tag on the amended commit.
 */
export function recreateAnnotatedTag(tag: string): void {
  const result = sync("git", ["tag", "-f", "-a", tag, "-m", tag], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(chalk.red("\nFailed to recreate tag\n"));
    process.exit(1);
  }
}

/**
 * Pushes the amended commit and tag to origin.
 * Uses --force-with-lease for the commit (safe force) and --force for the tag.
 */
export function pushToRemote(tag: string): void {
  console.log(chalk.cyan("\nPushing changes to remote...\n"));

  const pushResult = sync("git", ["push", "origin", "HEAD", "--force-with-lease"], { stdio: "inherit" });
  if (pushResult.status !== 0) {
    console.error(chalk.red("\nFailed to push commit\n"));
    process.exit(1);
  }

  const pushTagResult = sync("git", ["push", "origin", tag, "--force"], { stdio: "inherit" });
  if (pushTagResult.status !== 0) {
    console.error(chalk.red("\nFailed to push tag\n"));
    process.exit(1);
  }
}
