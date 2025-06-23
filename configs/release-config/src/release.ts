// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { valid, inc as semverInc, parse, gt } from "semver";
import { getPackageInfo, getVersionChoices, run, runIfNotDry, step, args, writePackageJson } from "./utils";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";

/**
 * Release function that prompts the user to select a release type and version, generates changelogs, commits changes, and pushes to GitHub.
 * @param packages - An array of package names to release.
 * @param bumpVersion - A function that takes a package name and version and updates the package.json file with the new version.
 * @param generateChangelog - A function that generates a changelog for a package with a given version.
 * @param toTag - A function that takes a version and returns a tag name.
 * @returns void
 * @throws Error if there are no packages to release or if the target version is invalid.
 */
export const release = async ({
  packages,
  bumpVersion,
  generateChangelog,
  toTag,
}: {
  packages: string[];
  bumpVersion: (pkgName: string, version: string) => void | Promise<void>;
  generateChangelog: (pkgName: string, version: string, workspaceName?: string) => void | Promise<void>;
  toTag: (version: string) => string;
}) => {
  let targetVersion: string | undefined;

  if (packages.length === 0) {
    throw new Error("No packages to release");
  }

  // Get any package.json info
  const { pkg } = getPackageInfo(packages[0]);

  if (!targetVersion) {
    const { release }: { release: string } = await prompts({
      type: "select",
      name: "release",
      message: "Select release type",
      choices: getVersionChoices(pkg.version),
    });

    if (release === "custom") {
      const res: { version: string } = await prompts({
        type: "text",
        name: "version",
        message: "Input custom version",
        initial: pkg.version,
      });
      targetVersion = res.version;
    } else {
      targetVersion = release;
    }
  }

  if (!valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  // Set default npm tag based on version suffix
  const prereleaseMatch = targetVersion.match(/-([a-zA-Z]+)(?:\.(\d+))?$/);
  if (prereleaseMatch && !args.tag) {
    args.tag = prereleaseMatch[1]; // extract prerelease type (next, alpha, beta)
  }

  // Ask for npm distribution tag if not already set
  if (!args.tag) {
    const { npmTag }: { npmTag: string } = await prompts({
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
      const res: { customTag: string } = await prompts({
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

  // Modify version based on selected npm tag if necessary
  if (args.tag && args.tag !== "latest") {
    const parsedVersion = parse(targetVersion);
    if (parsedVersion) {
      // Check if version needs updating
      const needsUpdate = !targetVersion.includes(`-${args.tag}`);

      if (needsUpdate) {
        // For non-latest tags, prepare new version
        let newVersion;
        let prereleaseNum = 0;

        // If the version is already a prerelease, just change the suffix
        if (parsedVersion.prerelease.length > 0) {
          // Keep prerelease number if applicable
          if (parsedVersion.prerelease.length > 1 && typeof parsedVersion.prerelease[1] === "number") {
            prereleaseNum = parsedVersion.prerelease[1];
          }

          // Replace existing prerelease tag
          const majorMinorPatch = `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
          newVersion = `${majorMinorPatch}-${args.tag}`;
        } else {
          // For stable versions, bump minor and add prerelease tag
          const minorBumped = semverInc(targetVersion, "minor");
          newVersion = `${minorBumped}-${args.tag}`;
        }

        // Ask if user wants to add prerelease number
        const { usePreNum }: { usePreNum: boolean } = await prompts({
          type: "confirm",
          name: "usePreNum",
          message: `Add prerelease number to version? (e.g. ${newVersion}.${prereleaseNum})`,
          initial: true,
        });

        if (usePreNum) {
          newVersion = `${newVersion}.${prereleaseNum}`;
        }
      }
    }
  }

  // Generate git tag from version
  const gitTag = toTag(targetVersion);

  // Generate commit message with npm tag info if necessary
  let commitMessage = `release: ${gitTag}`;
  if (args.tag && args.tag !== "latest") {
    commitMessage += ` with npm tag ${args.tag}`;
  }

  const { yes }: { yes: boolean } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing ${chalk.yellow(gitTag)}${args.tag && args.tag !== "latest" ? ` with npm tag ${chalk.blue(args.tag)}` : ""} Confirm?`,
  });

  if (!yes) return;

  for (let index = 0; index < packages.length; index++) {
    const element = packages[index];
    const { pkg, pkgPath } = getPackageInfo(element);

    step(`\nUpdating ${chalk.green(pkg.name)} package version to ${chalk.green(targetVersion)}...`);
    await bumpVersion(pkg.name, targetVersion);

    // Add or remove npmTag in package.json
    const updatedPkg = getPackageInfo(element);
    const pkgData: Record<string, unknown> = { ...updatedPkg.pkg };

    if (args.tag && args.tag !== "latest") {
      pkgData.npmTag = args.tag;
      await writePackageJson(updatedPkg.pkgPath, pkgData);
      console.log(`Set npmTag: ${chalk.blue(args.tag)} to ${chalk.green(pkg.name)}`);
    } else if (pkgData.npmTag) {
      delete pkgData.npmTag;
      await writePackageJson(updatedPkg.pkgPath, pkgData);
      console.log(`Removed npmTag from ${chalk.green(pkg.name)} for latest release.`);
    }

    step(`\nGenerating ${chalk.green(pkg.name)} changelog...`);
    await generateChangelog(pkg.name, targetVersion, element);
  }

  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommitting changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", commitMessage, "--no-verify"]);
    await runIfNotDry("git", ["tag", gitTag]);
  } else {
    console.log("No changes to commit.");
    return;
  }

  step("\nPushing to GitHub...");
  await runIfNotDry("git", ["push", "origin", `refs/tags/${gitTag}`]);
  await runIfNotDry("git", ["push"]);

  // Display npm tag info
  if (args.tag && args.tag !== "latest") {
    console.log(`\nNOTE: This release will be published to npm with tag ${chalk.blue(args.tag)}`);
  }

  console.log();
};
