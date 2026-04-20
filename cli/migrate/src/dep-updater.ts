import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import writeFileAtomic from "write-file-atomic";
import { BASELINE_VERSIONS } from "./baseline-versions.js";

export type PackageJsonDeps = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

const DEP_TYPES = ["dependencies", "devDependencies"] as const;

export function updateVcShellVersions(pkg: PackageJsonDeps, targetVersion: string): string[] {
  const changes: string[] = [];
  const newVersion = `^${targetVersion}`;
  for (const depType of DEP_TYPES) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (!name.startsWith("@vc-shell/")) continue;
      const oldVersion = deps[name];
      if (oldVersion === newVersion) continue;
      changes.push(`${name}: ${oldVersion} → ${newVersion}`);
      deps[name] = newVersion;
    }
  }
  return changes;
}

export function applyBaselineVersions(pkg: PackageJsonDeps): string[] {
  const changes: string[] = [];
  for (const depType of DEP_TYPES) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (name.startsWith("@vc-shell/")) continue;
      const baselineVersion = BASELINE_VERSIONS[name];
      if (!baselineVersion) continue;
      const oldVersion = deps[name];
      if (oldVersion === baselineVersion) continue;
      changes.push(`${name}: ${oldVersion} → ${baselineVersion}`);
      deps[name] = baselineVersion;
    }
  }
  return changes;
}

export function updateDependencyVersions(cwd: string, targetVersion: string, dryRun: boolean): string[] {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return [];

  const pkgRaw = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw) as PackageJsonDeps;

  const vcShellChanges = updateVcShellVersions(pkg, targetVersion);
  const baselineChanges = applyBaselineVersions(pkg);
  const changes = [...vcShellChanges, ...baselineChanges];

  if (changes.length > 0 && !dryRun) {
    writeFileAtomic.sync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  return changes;
}
