/**
 * App Setup Script (portal: flow)
 *
 * Prepares applications in apps/ for local development against the local
 * vc-shell framework via Yarn 4 portal: protocol. The app lives in apps/
 * but is NOT a workspace — it keeps its own node_modules and yarn.lock.
 *
 * What it does, per app in apps/:
 *   1. Saves a one-time backup snapshot to .vc-shell/setup-apps-backup.json.
 *   2. Rewrites @vc-shell/* deps in package.json to portal: absolute paths.
 *   3. Ensures compilerOptions.preserveSymlinks=true in tsconfig files.
 *   4. Ensures resolve.preserveSymlinks=true in vite config.
 *   5. Runs yarn install inside the app directory.
 *
 * Use `yarn unsetup:apps` to restore the backup and revert local app coupling.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const BACKUP_FILE = ".vc-shell/setup-apps-backup.json";

const TSCONFIG_CANDIDATES = ["tsconfig.json", "tsconfig.app.json"];
const VITE_CONFIG_CANDIDATES = [
  "vite.config.ts",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.mts",
  "vite.config.cts",
  "vite.config.cjs",
];

type AppSetupBackup = {
  version: 1;
  createdAt: string;
  files: Record<string, string | null>;
};

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

function ensureSetupBackup(appDir: string) {
  const backupPath = path.join(appDir, BACKUP_FILE);
  if (existsSync(backupPath)) {
    console.log(`  ${BACKUP_FILE}: backup already exists`);
    return;
  }

  const filesToBackup = ["package.json", "yarn.lock", ...TSCONFIG_CANDIDATES, ...VITE_CONFIG_CANDIDATES];
  const files: Record<string, string | null> = {};

  for (const relPath of filesToBackup) {
    const absPath = path.join(appDir, relPath);
    files[relPath] = existsSync(absPath) ? readFileSync(absPath, "utf-8") : null;
  }

  const snapshot: AppSetupBackup = {
    version: 1,
    createdAt: new Date().toISOString(),
    files,
  };

  mkdirSync(path.dirname(backupPath), { recursive: true });
  writeFileSync(backupPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`  ${BACKUP_FILE}: backup created`);
}

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

  // Ensure transitive @vc-shell workspace:* deps from portal-linked packages
  // can be resolved in isolated apps/* installs.
  const resolutions = (appPkg.resolutions ??= {}) as Record<string, string>;
  for (const [dep, workspaceRelPath] of Object.entries(PACKAGE_TO_WORKSPACE_PATH)) {
    const portalTarget = `portal:${path.join(ROOT, workspaceRelPath)}`;
    if (resolutions[dep] !== portalTarget) {
      const from = resolutions[dep] ?? "(not set)";
      console.log(`  resolutions.${dep}: ${from} -> ${portalTarget}`);
      resolutions[dep] = portalTarget;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(appPkg, null, 2) + "\n");
  }

  return changed;
}

function ensureTsconfigPreserveSymlinks(appDir: string) {
  for (const name of TSCONFIG_CANDIDATES) {
    const tsconfigPath = path.join(appDir, name);
    if (!existsSync(tsconfigPath)) continue;

    const raw = readFileSync(tsconfigPath, "utf-8");

    if (/"preserveSymlinks"\s*:\s*true/.test(raw)) {
      console.log(`  ${name}: preserveSymlinks already true`);
      continue;
    }

    if (/"preserveSymlinks"\s*:\s*false/.test(raw)) {
      const updated = raw.replace(/"preserveSymlinks"\s*:\s*false/g, '"preserveSymlinks": true');
      writeFileSync(tsconfigPath, updated);
      console.log(`  ${name}: updated preserveSymlinks false -> true`);
      continue;
    }

    if (/^([ \t]*)"compilerOptions"\s*:\s*\{/m.test(raw)) {
      const updated = raw.replace(
        /^([ \t]*)"compilerOptions"\s*:\s*\{/m,
        (match, indent: string) => `${match}\n${indent}  "preserveSymlinks": true,`,
      );
      writeFileSync(tsconfigPath, updated);
      console.log(`  ${name}: added compilerOptions.preserveSymlinks = true`);
      continue;
    }

    console.log(`  ${name}: skip (no compilerOptions block found)`);
  }
}

function ensureViteConfigPreserveSymlinks(appDir: string) {
  for (const name of VITE_CONFIG_CANDIDATES) {
    const vitePath = path.join(appDir, name);
    if (!existsSync(vitePath)) continue;

    const raw = readFileSync(vitePath, "utf-8");
    if (/preserveSymlinks\s*:\s*true/.test(raw)) {
      console.log(`  ${name}: preserveSymlinks already true`);
      continue;
    }

    // Common host-app template:
    // export default getApplicationConfiguration(mfHostConfig());
    if (/export\s+default\s+getApplicationConfiguration\(\s*mfHostConfig\(\)\s*\)\s*;?/m.test(raw)) {
      const updated = raw.replace(
        /export\s+default\s+getApplicationConfiguration\(\s*mfHostConfig\(\)\s*\)\s*;?/m,
        [
          "const mfConfig = mfHostConfig();",
          "",
          "export default getApplicationConfiguration({",
          "  ...mfConfig,",
          "  resolve: {",
          "    ...(mfConfig.resolve ?? {}),",
          "    preserveSymlinks: true,",
          "  },",
          "});",
        ].join("\n"),
      );
      writeFileSync(vitePath, updated);
      console.log(`  ${name}: added resolve.preserveSymlinks via mfHostConfig wrapper`);
      continue;
    }

    // Common standalone template:
    // export default getApplicationConfiguration({ ... });
    if (/export\s+default\s+getApplicationConfiguration\(\s*\{/m.test(raw)) {
      const updated = raw.replace(
        /export\s+default\s+getApplicationConfiguration\(\s*\{/m,
        ["export default getApplicationConfiguration({", "  resolve: {", "    preserveSymlinks: true,", "  },"].join(
          "\n",
        ),
      );
      writeFileSync(vitePath, updated);
      console.log(`  ${name}: added resolve.preserveSymlinks to getApplicationConfiguration`);
      continue;
    }

    // Generic defineConfig(...) object literal
    if (/export\s+default\s+defineConfig\(\s*\{/m.test(raw)) {
      const updated = raw.replace(
        /export\s+default\s+defineConfig\(\s*\{/m,
        ["export default defineConfig({", "  resolve: {", "    preserveSymlinks: true,", "  },"].join("\n"),
      );
      writeFileSync(vitePath, updated);
      console.log(`  ${name}: added resolve.preserveSymlinks to defineConfig`);
      continue;
    }

    console.log(`  ${name}: skip (unrecognized config pattern)`);
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

    ensureSetupBackup(appDir);
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

  console.log("\nDone. To roll back local portal setup run `yarn unsetup:apps`.");
}

run();
