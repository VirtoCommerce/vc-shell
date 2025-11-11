import fs from "node:fs";
import path from "node:path";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

/**
 * Detects the package manager used in the project by checking for lock files
 */
export async function getPackageManager(cwd: string): Promise<PackageManager> {
  // Check for lock files in order of preference
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  if (fs.existsSync(path.join(cwd, "bun.lockb"))) {
    return "bun";
  }

  if (fs.existsSync(path.join(cwd, "package-lock.json"))) {
    return "npm";
  }

  // Default to npm if no lock file is found
  return "npm";
}

/**
 * Get the install command for the detected package manager
 */
export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case "npm":
      return "install";
    case "yarn":
    case "pnpm":
    case "bun":
      return "add";
  }
}

/**
 * Get the dev flag for the detected package manager
 */
export function getDevFlag(packageManager: PackageManager): string {
  switch (packageManager) {
    case "npm":
      return "--save-dev";
    case "yarn":
    case "pnpm":
    case "bun":
      return "-D";
  }
}

/**
 * Get the run command for the detected package manager
 */
export function getRunCommand(packageManager: PackageManager, script: string): string {
  switch (packageManager) {
    case "npm":
      return `npm run ${script}`;
    case "yarn":
      return `yarn ${script}`;
    case "pnpm":
      return `pnpm ${script}`;
    case "bun":
      return `bun run ${script}`;
  }
}

/**
 * Get a formatted string representing the package manager
 */
export function formatPackageManager(packageManager: PackageManager): string {
  return packageManager.charAt(0).toUpperCase() + packageManager.slice(1);
}

