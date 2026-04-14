import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, rmdirSync } from "node:fs";
import { join } from "node:path";
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const PACKAGE_NAME = "@vc-shell/release-config";

const transform: Transform = (_fileInfo: FileInfo, api: API, options: Options): string | null => {
  const cwd = (options as any).cwd ?? ".";
  const dryRun = (options as any).dryRun ?? false;

  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return null;

  const pkgContent = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgContent);

  const hasReleaseConfig = pkg.devDependencies?.[PACKAGE_NAME] || pkg.dependencies?.[PACKAGE_NAME];

  if (!hasReleaseConfig) return null;

  // 1. Remove from devDependencies / dependencies
  if (pkg.devDependencies?.[PACKAGE_NAME]) {
    delete pkg.devDependencies[PACKAGE_NAME];
    api.report(`Removed ${PACKAGE_NAME} from devDependencies`);
  }
  if (pkg.dependencies?.[PACKAGE_NAME]) {
    delete pkg.dependencies[PACKAGE_NAME];
    api.report(`Removed ${PACKAGE_NAME} from dependencies`);
  }

  // 2. Remove "release" script if it references release-config or scripts/release
  if (pkg.scripts?.release) {
    const releaseScript: string = pkg.scripts.release;
    if (releaseScript.includes("release-config") || releaseScript.includes("scripts/release")) {
      delete pkg.scripts.release;
      api.report(`Removed "release" script from package.json`);
    }
  }

  if (!dryRun) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }

  // 3. Remove scripts/release.ts
  const scriptsDir = join(cwd, "scripts");
  const releaseFile = join(scriptsDir, "release.ts");

  if (existsSync(releaseFile)) {
    if (!dryRun) {
      unlinkSync(releaseFile);
    }
    api.report(`Deleted scripts/release.ts`);

    // Remove scripts/ directory if empty
    if (existsSync(scriptsDir)) {
      const remaining = readdirSync(scriptsDir);
      if (remaining.length === 0) {
        if (!dryRun) {
          rmdirSync(scriptsDir);
        }
        api.report(`Deleted empty scripts/ directory`);
      }
    }
  }

  return null; // Changes done via direct file I/O
};

export default transform;
export const parser = "tsx";
