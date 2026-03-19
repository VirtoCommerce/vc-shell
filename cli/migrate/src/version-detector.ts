import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import semver from "semver";

const FRAMEWORK_PKG = "@vc-shell/framework";

export function detectFrameworkVersion(cwd: string): string | null {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return null;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const version =
    pkg.dependencies?.[FRAMEWORK_PKG] ??
    pkg.devDependencies?.[FRAMEWORK_PKG] ??
    pkg.peerDependencies?.[FRAMEWORK_PKG];

  if (!version) return null;

  if (version.startsWith("workspace:")) {
    return resolveFromNodeModules(cwd);
  }

  // For prerelease versions, minVersion preserves the prerelease tag
  const min = semver.minVersion(version);
  if (min) return min.version;

  const coerced = semver.coerce(version);
  return coerced ? coerced.version : null;
}

function resolveFromNodeModules(cwd: string): string | null {
  const nmPkgPath = join(
    cwd,
    "node_modules",
    "@vc-shell",
    "framework",
    "package.json",
  );
  if (!existsSync(nmPkgPath)) return null;
  const pkg = JSON.parse(readFileSync(nmPkgPath, "utf-8"));
  return pkg.version ?? null;
}
