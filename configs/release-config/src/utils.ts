import { readFileSync } from "node:fs";
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
  };

  return { pkg, pkgDir, pkgPath };
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
  function inc(i: ReleaseType, identifier?: string) {
    if (i === "prerelease" && identifier === "alpha") {
      if (currentVersion.includes("-alpha")) {
        const [base, pre] = currentVersion.split("-alpha.");
        const nextPre = parseInt(pre) + 1;
        return `${base}-alpha.${nextPre}`;
      }
      const baseVersion = semverInc(currentVersion, "patch");
      return `${baseVersion}-alpha.0`;
    }
    return semverInc(currentVersion, i);
  }

  const versionChoices: VersionChoice[] = [
    {
      title: "next",
      value: inc("patch"),
    },
    {
      title: "alpha",
      value: inc("prerelease", "alpha"),
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
