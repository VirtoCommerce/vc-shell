import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { SpawnSyncOptionsWithStringEncoding } from "node:child_process";
import type { ReleaseType } from "semver";
import { inc as semverInc } from "semver";
import mri from "mri";
import { argv } from "node:process";
import { sync } from "cross-spawn";

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
    stableVersion?: string;
  };

  return { pkg, pkgDir, pkgPath };
}

export async function writePackageJson(pkgPath: string, pkg: any): Promise<void> {
  if (isDryRun) {
    console.log(chalk.blue(`[dryrun] Writing package.json to ${pkgPath}`));
    return;
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
}

export async function run(bin: string, args: string[], opts?: Partial<SpawnSyncOptionsWithStringEncoding>) {
  return sync(bin, args, { stdio: "inherit", ...opts });
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
  value: string | null;
}

export function getVersionChoices(currentVersion: string): VersionChoice[] {
  // Yarn supports only standard semver strategies: major, minor, patch, prerelease
  // For prerelease versions, we need to handle them properly
  function getNextVersion(strategy: ReleaseType, identifier?: string): string {
    if (strategy === "prerelease") {
      // For prerelease, use standard semver prerelease without custom identifiers
      // This ensures yarn compatibility
      return semverInc(currentVersion, "prerelease") || currentVersion;
    }
    return semverInc(currentVersion, strategy) || currentVersion;
  }

  const versionChoices: VersionChoice[] = [
    {
      title: "patch",
      value: getNextVersion("patch"),
    },
    {
      title: "minor",
      value: getNextVersion("minor"),
    },
    {
      title: "major",
      value: getNextVersion("major"),
    },
    {
      title: "prerelease",
      value: getNextVersion("prerelease"),
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
