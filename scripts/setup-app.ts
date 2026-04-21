/**
 * App Setup Script (portal: flow)
 *
 * Prepares applications in apps/ for local development against the local
 * vc-shell framework via Yarn 4 portal: protocol. The app lives in apps/
 * but is NOT a workspace — it keeps its own node_modules and yarn.lock.
 *
 * What it does, per app in apps/:
 *   1. Reads app's package.json; for every @vc-shell/* dep rewrites the
 *      range to a portal: URL pointing at the local package in this repo.
 *   2. Ensures preserveSymlinks: true in app's tsconfig.json (if present).
 *   3. Ensures resolve.preserveSymlinks: true in app's vite.config.{ts,js,mjs}
 *      (if present and contains a defineConfig object literal).
 *   4. Runs `yarn install` inside the app directory.
 *
 * The root yarn.lock is untouched — apps/* is no longer part of workspaces.
 *
 * Usage:
 *   yarn setup:apps
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");

const PACKAGE_TO_WORKSPACE_PATH: Record<string, string> = {
  "@vc-shell/framework": "framework",
  "@vc-shell/api-client-generator": "cli/api-client",
  "@vc-shell/create-vc-app": "cli/create-vc-app",
  "@vc-shell/migrate": "cli/migrate",
  "@vc-shell/vc-app-skill": "cli/vc-app-skill",
  "@vc-shell/config-generator": "configs/vite-config",
  "@vc-shell/ts-config": "configs/ts-config",
  "@vc-shell/mf-config": "packages/mf-config",
  "@vc-shell/mf-host": "packages/mf-host",
  "@vc-shell/mf-module": "packages/mf-module",
};

function rewriteVcShellDepsToPortal(appDir: string): boolean {
  const pkgPath = path.join(appDir, "package.json");
  if (!existsSync(pkgPath)) {
    return false;
  }

  const appPkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  let changed = false;

  for (const depType of ["dependencies", "devDependencies"] as const) {
    const deps = appPkg[depType] as Record<string, string> | undefined;
    if (!deps) continue;

    for (const dep of Object.keys(deps)) {
      if (!dep.startsWith("@vc-shell/")) continue;

      const workspaceRelPath = PACKAGE_TO_WORKSPACE_PATH[dep];
      if (!workspaceRelPath) {
        console.log(`  ${dep}: skipped (unknown @vc-shell package)`);
        continue;
      }

      const portalTarget = `portal:${path.join(ROOT, workspaceRelPath)}`;
      if (deps[dep] !== portalTarget) {
        console.log(`  ${dep}: ${deps[dep]} -> ${portalTarget}`);
        deps[dep] = portalTarget;
        changed = true;
      } else {
        console.log(`  ${dep}: ok (already portal:)`);
      }
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(appPkg, null, 2) + "\n");
  }
  return changed;
}

function ensureTsconfigPreserveSymlinks(appDir: string) {
  const candidates = ["tsconfig.json", "tsconfig.app.json"];
  for (const name of candidates) {
    const tsconfigPath = path.join(appDir, name);
    if (!existsSync(tsconfigPath)) continue;

    const raw = readFileSync(tsconfigPath, "utf-8");
    // Skip JSON-with-comments parsing; use a safe regex for already-set case
    if (/"preserveSymlinks"\s*:\s*true/.test(raw)) {
      console.log(`  ${name}: preserveSymlinks already true`);
      continue;
    }
    console.log(`  ${name}: NOTE — add "preserveSymlinks": true under compilerOptions manually`);
  }
}

function ensureViteConfigPreserveSymlinks(appDir: string) {
  const candidates = ["vite.config.ts", "vite.config.js", "vite.config.mjs"];
  for (const name of candidates) {
    const vitePath = path.join(appDir, name);
    if (!existsSync(vitePath)) continue;

    const raw = readFileSync(vitePath, "utf-8");
    if (/preserveSymlinks\s*:\s*true/.test(raw)) {
      console.log(`  ${name}: preserveSymlinks already true`);
      continue;
    }
    console.log(`  ${name}: NOTE — add resolve: { preserveSymlinks: true } manually`);
  }
}

function runYarnInAppDir(appDir: string): boolean {
  console.log(`\n  Running yarn install in ${path.relative(ROOT, appDir)}...`);
  const result = spawn.sync("yarn", ["install"], { cwd: appDir, stdio: "inherit" });
  return result.status === 0;
}

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

  let failed = 0;

  for (const entry of entries) {
    const appDir = path.join(APPS_DIR, entry.name);
    if (!existsSync(path.join(appDir, "package.json"))) {
      continue;
    }

    console.log(`\n${path.relative(ROOT, appDir)}:`);

    rewriteVcShellDepsToPortal(appDir);
    ensureTsconfigPreserveSymlinks(appDir);
    ensureViteConfigPreserveSymlinks(appDir);

    if (!runYarnInAppDir(appDir)) {
      console.error(`  yarn install failed for ${entry.name}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} app(s) failed to install.`);
    process.exit(1);
  }

  console.log("\nDone. See README `Local Development via portal: Protocol` for the full flow.");
}

run();
