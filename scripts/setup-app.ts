/**
 * App Setup Script
 *
 * Prepares applications in apps/ for local development with the monorepo.
 * Useful when you have an existing vc-shell app from a separate repository
 * and want to link it against local framework packages.
 *
 * What it does:
 *   1. Removes yarn.lock from each app (so Yarn workspace resolution kicks in)
 *   2. Updates @vc-shell/* dependency versions to match the monorepo
 *   3. Runs yarn install
 *
 * Usage:
 *   yarn setup:apps
 */

import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

function run() {
  if (!existsSync(APPS_DIR)) {
    console.log("No apps/ directory found — nothing to do.");
    return;
  }

  const entries = readdirSync(APPS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length === 0) {
    console.log("No apps found in apps/ — nothing to do.");
    return;
  }

  const rootPkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf-8"));
  const monoVersion = rootPkg.version as string;

  for (const entry of entries) {
    const appDir = path.join(APPS_DIR, entry.name);
    const pkgPath = path.join(appDir, "package.json");

    if (!existsSync(pkgPath)) {
      continue;
    }

    const appPkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    console.log(`\n${path.relative(ROOT, appDir)}:`);

    // 1. Remove yarn.lock
    const lockPath = path.join(appDir, "yarn.lock");
    if (existsSync(lockPath)) {
      unlinkSync(lockPath);
      console.log("  Removed yarn.lock");
    }

    // 2. Sync @vc-shell/* versions
    let changed = false;
    const targetVersion = `^${monoVersion}`;

    for (const depType of ["dependencies", "devDependencies"] as const) {
      const deps = appPkg[depType] as Record<string, string> | undefined;
      if (!deps) continue;

      for (const dep of Object.keys(deps)) {
        if (!dep.startsWith("@vc-shell/")) continue;

        if (deps[dep] !== targetVersion) {
          console.log(`  ${dep}: ${deps[dep]} -> ${targetVersion}`);
          deps[dep] = targetVersion;
          changed = true;
        } else {
          console.log(`  ${dep}: ok (${deps[dep]})`);
        }
      }
    }

    if (changed) {
      writeFileSync(pkgPath, JSON.stringify(appPkg, null, 2) + "\n");
    }

    if (!changed) {
      const hasDeps = Object.keys(appPkg.dependencies ?? {})
        .concat(Object.keys(appPkg.devDependencies ?? {}))
        .some((d: string) => d.startsWith("@vc-shell/"));
      if (!hasDeps) {
        console.log("  No @vc-shell/* dependencies found");
      }
    }
  }

  // 3. Run yarn install
  console.log("\nRunning yarn install...");
  const result = spawn.sync("yarn", ["install"], { cwd: ROOT, stdio: "inherit" });

  if (result.status !== 0) {
    console.error("yarn install failed");
    process.exit(1);
  }

  console.log("\nDone.");
}

run();
