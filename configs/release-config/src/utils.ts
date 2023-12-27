import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { SpawnSyncOptionsWithStringEncoding, spawnSync } from "node:child_process";
import type { ReleaseType } from "semver";
import { inc as semverInc } from "semver";
import mri from "mri";
import { argv } from "node:process";

export const args = mri(argv.slice(2));

export const isDryRun = !!args.dry;

if (isDryRun) {
  console.log(chalk.inverse(chalk.yellow(" DRY RUN ")));
  console.log();
}

export function getPackageInfo(pkgName: string) {
  const pkgDir = path.resolve(pkgName);
  const pkgPath = path.resolve(pkgDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
    name: string;
    version: string;
  };

  return { pkg, pkgDir, pkgPath };
}

export async function run(bin: string, args: string[], opts?: Partial<SpawnSyncOptionsWithStringEncoding>) {
  return spawnSync(bin, args, { stdio: "inherit", ...opts });
}

export async function dryRun(
  bin: string,
  args: string[],
  opts?: Partial<SpawnSyncOptionsWithStringEncoding>,
): Promise<void> {
  return console.log(chalk.blue(`[dryrun] ${bin} ${args.join(" ")}`), opts || "");
}

export const runIfNotDry = isDryRun ? dryRun : run;

export function step(msg: string): void {
  return console.log(chalk.cyan(msg));
}

interface VersionChoice {
  title: string;
  value: string;
}

export function getVersionChoices(currentVersion: string): VersionChoice[] {
  function inc(i: ReleaseType) {
    return semverInc(currentVersion, i);
  }

  const versionChoices: VersionChoice[] = [
    {
      title: "next",
      value: inc("patch"),
    },
    {
      title: "minor",
      value: inc("minor"),
    },
    {
      title: "major",
      value: inc("major"),
    },
    {
      value: "custom",
      title: "custom",
    },
  ].map((i) => {
    i.title = `${i.title} (${i.value})`;
    return i;
  });

  return versionChoices;
}
