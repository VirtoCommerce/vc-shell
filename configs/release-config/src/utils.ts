import { readFileSync } from "node:fs";
import path from "node:path";
import mri from "mri";
import { argv } from "node:process";

export const args = mri(argv.slice(2));

export const isDryRun = !!args.dry;

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
