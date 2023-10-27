import prompts from "prompts";
import semver from "semver";
import colors from "picocolors";
import { args, getPackageInfo, getVersionChoices, isDryRun, run, runIfNotDry, step, updateVersion } from "./utils";

export const release = async ({ packages, bumpVersion, generateChangelog, toTag, getPkgDir }) => {
  let targetVersion: string | undefined;

  const selectedPkg: string =
    packages.length === 1
      ? packages[0]
      : (
          await prompts({
            type: "select",
            name: "pkg",
            message: "Select package",
            choices: packages.map((i) => ({ value: i, title: i })),
          })
        ).pkg;

  if (!selectedPkg) return;

  const { pkg, pkgPath } = getPackageInfo(selectedPkg, getPkgDir);

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

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  const tag = toTag(selectedPkg, targetVersion);

  const { yes }: { yes: boolean } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Releasing ${colors.yellow(tag)} Confirm?`,
  });

  if (!yes) return;

  step("\nUpdating package version...");
  await bumpVersion(selectedPkg, targetVersion);

  step("\nGenerating changelog...");
  await generateChangelog(selectedPkg, targetVersion);

  // const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  // if (stdout) {
  //   step("\nCommitting changes...");
  //   await runIfNotDry("git", ["add", "-A"]);
  //   await runIfNotDry("git", ["commit", "-m", `release: ${tag}`]);
  //   await runIfNotDry("git", ["tag", tag]);
  // } else {
  //   console.log("No changes to commit.");
  //   return;
  // }

  // step("\nPushing to GitHub...");
  // await runIfNotDry("git", ["push", "origin", `refs/tags/${tag}`]);
  // await runIfNotDry("git", ["push"]);

  console.log();
};
