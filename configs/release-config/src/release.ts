// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { valid } from "semver";
import { getPackageInfo, getVersionChoices, run, runIfNotDry, step } from "./utils";
import chalk from "chalk";

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

  const tag = toTag(targetVersion);

  const { yes }: { yes: boolean } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing ${chalk.yellow(tag)} Confirm?`,
  });

  if (!yes) return;

  for (let index = 0; index < packages.length; index++) {
    const element = packages[index];
    const { pkg } = getPackageInfo(element);

    step(`\nUpdating ${chalk.green(pkg.name)} package version to ${chalk.green(targetVersion)}...`);
    await bumpVersion(pkg.name, targetVersion);

    step(`\nGenerating ${chalk.green(pkg.name)} changelog...`);
    await generateChangelog(pkg.name, targetVersion, element);
  }

  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommitting changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", `release: ${tag}`, "--no-verify"]);
    await runIfNotDry("git", ["tag", tag]);
  } else {
    console.log("No changes to commit.");
    return;
  }

  step("\nPushing to GitHub...");
  await runIfNotDry("git", ["push", "origin", `refs/tags/${tag}`]);
  await runIfNotDry("git", ["push"]);

  console.log();
};
