import prompts from "prompts";
import { valid } from "semver";
import { getPackageInfo, getVersionChoices, run, runIfNotDry, step, updateVersion } from "./utils";
import chalk from "chalk";

export const release = async ({
  packages,
  bumpVersion,
  generateChangelog,
  toTag,
  getPkgDir,
}: {
  packages: string[];
  bumpVersion: (pkgName: string, version: string) => void | Promise<void>;
  generateChangelog: (pkgName: string, version: string, workspaceName?: string) => void | Promise<void>;
  toTag: (version: string) => string;
  getPkgDir?: (pkgName: string) => string;
}) => {
  let targetVersion: string | undefined;

  // Get root package.json info
  const { pkg, pkgPath } = getPackageInfo("", getPkgDir);

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

  step(`\nUpdating root workspace ${chalk.green(pkg.name)} package version to ${chalk.green(targetVersion)}...`);
  updateVersion(pkgPath, targetVersion);

  step(`\nGenerating root workspace ${chalk.green(pkg.name)} changelog...`);
  await generateChangelog(pkg.name, targetVersion);

  for (let index = 0; index < packages.length; index++) {
    const element = packages[index];
    const { pkg } = getPackageInfo(element, getPkgDir);

    step(`\nUpdating ${chalk.green(pkg.name)} package version to ${chalk.green(targetVersion)}...`);
    await bumpVersion(pkg.name, targetVersion);

    step(`\nGenerating ${chalk.green(pkg.name)} changelog...`);
    await generateChangelog(pkg.name, targetVersion, element);
  }

  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommitting changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", `release: ${tag}`]);
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
