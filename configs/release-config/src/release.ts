import { parse } from "semver";
import { getPackageInfo, args } from "@release-config/utils";
import chalk from "chalk";
import { sync } from "cross-spawn";
import { readFileSync, writeFileSync } from "node:fs";
import type { ReleaseConfig } from "@release-config/types";
import {
  promptReleaseType,
  promptPrereleaseId,
  promptCustomVersion,
  confirmRelease,
  cancelled,
} from "@release-config/prompts";
import {
  buildLernaVersionArgs,
  runLernaVersion,
  captureVersionsBefore,
  getNewVersionIfChanged,
  logDiagnostics,
} from "@release-config/lerna";
import {
  enhancePackageChangelogs,
  generateRootChangelog,
  backfillEmptyVersions,
  deduplicateChangelog,
  insertMissingVersionEntries,
  supplementIncompleteVersions,
} from "@release-config/changelog";
import {
  findLastMatchingTag,
  getLatestTag,
  getHeadCommitMessage,
  stageAndAmendCommit,
  recreateAnnotatedTag,
  pushToRemote,
} from "@release-config/git";

/**
 * Interactive release flow: prompts for release type, runs Lerna version,
 * enhances changelogs, and pushes to remote.
 */
export async function release(config: ReleaseConfig): Promise<void> {
  const {
    packages,
    tagVersionPrefix = "v",
    customHooks,
    updateRootVersion: shouldUpdateRootVersion = true,
    forcePublish: shouldForcePublish = false,
  } = config;

  if (packages.length === 0) {
    throw new Error("No packages to release");
  }

  const isDryRun = !!args.dry;

  if (isDryRun) {
    console.log(chalk.yellow("\nDRY RUN MODE - No git operations will be performed\n"));
  }

  // ── Diagnostics ──────────────────────────────────────────────────────
  const { pkg } = getPackageInfo(packages[0].path);
  const currentVersion = pkg.version;
  const majorMinor = currentVersion.split(".").slice(0, 2).join(".");
  const lastTag = findLastMatchingTag(majorMinor, tagVersionPrefix);

  logDiagnostics(tagVersionPrefix, majorMinor, lastTag);

  // ── Prompt: release type ─────────────────────────────────────────────
  const releaseType = await promptReleaseType();
  if (!releaseType) return cancelled();

  // Build lerna args based on release type
  const releaseTypeArgs: string[] = [];

  if (releaseType === "auto") {
    // --conventional-commits is now always added via buildLernaVersionArgs
  } else if (releaseType === "prerelease") {
    const result = await promptPrereleaseId(currentVersion);
    if (!result) return cancelled();

    releaseTypeArgs.push(result.lernaVersionArg, ...result.lernaPreidArgs);

    // Determine npm tag from preid
    if (!args.tag) {
      args.tag = result.preid;
    }
  } else if (releaseType === "graduate") {
    releaseTypeArgs.push("--conventional-graduate");
  } else if (releaseType === "custom") {
    const customVersion = await promptCustomVersion(currentVersion);
    if (!customVersion) return cancelled();

    releaseTypeArgs.push(customVersion);

    // Determine npm tag from version
    const parsed = parse(customVersion);
    if (parsed && parsed.prerelease.length > 0 && !args.tag) {
      const prereleaseId = parsed.prerelease[0];
      if (typeof prereleaseId === "string") {
        args.tag = prereleaseId;
      }
    }
  }

  // ── Confirm ──────────────────────────────────────────────────────────
  if (!(await confirmRelease())) return cancelled();

  // ── Run Lerna ────────────────────────────────────────────────────────
  const lernaArgs = buildLernaVersionArgs(releaseTypeArgs, {
    tagVersionPrefix,
    isDryRun,
    forcePublish: shouldForcePublish || !!args.force,
  });

  const versionsBefore = captureVersionsBefore(packages);
  runLernaVersion(lernaArgs);

  const newVersion = getNewVersionIfChanged(packages, versionsBefore);
  if (!newVersion) {
    console.log(chalk.yellow("\nNo packages were versioned. Nothing to release.\n"));
    return;
  }

  // ── Post-version steps ───────────────────────────────────────────────

  // Update root package.json
  if (shouldUpdateRootVersion) {
    updateRootVersion(newVersion, isDryRun);
  }

  // Custom hooks (e.g. update boilerplate deps)
  if (customHooks) {
    console.log(chalk.cyan("\nRunning post-version hooks...\n"));
    await customHooks(newVersion);
  }

  // Update yarn.lock
  if (!isDryRun) {
    console.log(chalk.cyan("\nUpdating yarn.lock with new package versions...\n"));
    const yarnResult = sync("yarn", ["install"], { stdio: "inherit" });
    if (yarnResult.status !== 0) {
      console.error(chalk.red("\nFailed to update yarn.lock\n"));
      process.exit(yarnResult.status || 1);
    }
  }

  // Enhance changelogs
  enhancePackageChangelogs(packages, isDryRun);
  insertMissingVersionEntries(packages, tagVersionPrefix, isDryRun);
  backfillEmptyVersions(packages, tagVersionPrefix, isDryRun);
  supplementIncompleteVersions(packages, tagVersionPrefix, isDryRun);
  deduplicateChangelog(packages, isDryRun);
  generateRootChangelog({ packages }, isDryRun);

  // ── Git: amend, tag, push ────────────────────────────────────────────
  if (!isDryRun) {
    const tag = getLatestTag();
    if (!tag) {
      console.error(chalk.red("\nCould not determine the git tag created by Lerna\n"));
      process.exit(1);
    }

    // Validate HEAD is the release commit before amending
    const headMessage = getHeadCommitMessage();
    const expectedPrefix = `release: ${tagVersionPrefix}`;
    if (!headMessage || !headMessage.startsWith(expectedPrefix)) {
      console.error(
        chalk.red(
          `\nTag validation failed: HEAD commit message "${headMessage}" ` +
            `does not match expected pattern "${expectedPrefix}*".\n` +
            `This may indicate extra commits were made after Lerna's release commit.\n` +
            `Aborting to prevent amending/tagging the wrong commit.\n`,
        ),
      );
      process.exit(1);
    }

    stageAndAmendCommit();
    recreateAnnotatedTag(tag);
    pushToRemote(tag);

    console.log(chalk.green("\nRelease completed successfully!\n"));
    console.log(chalk.cyan(`npmTag will be automatically determined from git tag in CI\n`));
  } else {
    console.log(chalk.yellow("\nDry run completed successfully!\n"));
    console.log(chalk.cyan("Changes made:"));
    console.log(chalk.cyan("  - Updated package versions"));
    console.log(chalk.cyan("  - Generated/updated CHANGELOG.md files\n"));
    console.log(chalk.yellow("No git operations performed. Review changes with:"));
    console.log(chalk.cyan("  git diff\n"));
    console.log(chalk.yellow("To revert all changes:"));
    console.log(chalk.cyan("  git checkout -- .\n"));
  }
}

// ── Internal helpers ───────────────────────────────────────────────────

function updateRootVersion(newVersion: string, dryRun: boolean): void {
  const rootPkgPath = "package.json";
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));

  if (rootPkg.version !== newVersion) {
    rootPkg.version = newVersion;
    if (!dryRun) {
      writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n", "utf-8");
    }
    console.log(chalk.gray(`  Updated root package.json version: ${newVersion}`));
  }
}
