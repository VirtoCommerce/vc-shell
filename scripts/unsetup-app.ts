/**
 * App Unsetup Script (portal: rollback)
 *
 * Restores app files from setup snapshot created by `yarn setup:apps`.
 * For each app in apps/ with backup file .vc-shell/setup-apps-backup.json:
 *   1. Restores original package.json/yarn.lock/config files.
 *   2. Removes the backup file.
 *   3. Runs yarn install in app directory.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const BACKUP_FILE = ".vc-shell/setup-apps-backup.json";

type AppSetupBackup = {
  version: number;
  createdAt: string;
  files: Record<string, string | null>;
};

type RestoreStatus = "restored" | "skipped" | "failed";

function restoreFromBackup(appDir: string): RestoreStatus {
  const backupPath = path.join(appDir, BACKUP_FILE);
  if (!existsSync(backupPath)) {
    console.log(`  ${BACKUP_FILE}: no backup found, skip`);
    return "skipped";
  }

  let backup: AppSetupBackup;
  try {
    backup = JSON.parse(readFileSync(backupPath, "utf-8")) as AppSetupBackup;
  } catch (error) {
    console.error(`  ${BACKUP_FILE}: invalid JSON (${(error as Error).message})`);
    return "failed";
  }

  if (!backup || typeof backup !== "object" || !backup.files || typeof backup.files !== "object") {
    console.error(`  ${BACKUP_FILE}: invalid backup structure`);
    return "failed";
  }

  for (const [relPath, content] of Object.entries(backup.files)) {
    const absPath = path.join(appDir, relPath);

    if (content === null) {
      if (existsSync(absPath)) {
        rmSync(absPath, { force: true, recursive: true });
        console.log(`  restored: removed ${relPath}`);
      }
      continue;
    }

    mkdirSync(path.dirname(absPath), { recursive: true });
    writeFileSync(absPath, content);
    console.log(`  restored: ${relPath}`);
  }

  rmSync(backupPath, { force: true });
  try {
    rmSync(path.dirname(backupPath));
  } catch {
    // Directory may be non-empty or absent.
  }

  return "restored";
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
  let restoredCount = 0;

  for (const entry of entries) {
    const appDir = path.join(APPS_DIR, entry.name);
    const backupPath = path.join(appDir, BACKUP_FILE);
    if (!existsSync(backupPath)) {
      continue;
    }

    console.log(`\n${path.relative(ROOT, appDir)}:`);

    const status = restoreFromBackup(appDir);
    if (status === "failed") {
      failed++;
      continue;
    }

    if (status === "skipped") {
      continue;
    }

    restoredCount++;

    if (existsSync(path.join(appDir, "package.json")) && !runYarnInAppDir(appDir)) {
      console.error(`  yarn install failed for ${entry.name}`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} app(s) failed to rollback.`);
    process.exit(1);
  }

  if (restoredCount === 0) {
    console.log("No setup backups found in apps/ — nothing to rollback.");
    return;
  }

  console.log("\nDone. Apps restored from setup backups.");
}

run();
