/**
 * Cross-platform path utilities
 *
 * Normalizes paths to use forward slashes for consistent comparison
 * across Windows and Unix systems.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Normalize path separators to forward slashes
 * Works on both Windows (backslashes) and Unix (forward slashes)
 */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Check if the given path is within a compiled dist build
 * Cross-platform compatible
 */
export function isCompiledBuild(dirPath: string): boolean {
  return normalizePath(dirPath).includes("/dist");
}

/**
 * Get the directory path for the current ES module
 * Replaces __dirname in ES modules
 */
export function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

/**
 * Resolve path to schemas directory based on current execution context
 */
export function getSchemasPath(currentDir: string): string {
  return isCompiledBuild(currentDir)
    ? path.join(currentDir, "schemas")
    : path.join(currentDir, "..", "schemas");
}

/**
 * Resolve path to examples directory based on current execution context
 */
export function getExamplesPath(currentDir: string): string {
  return isCompiledBuild(currentDir)
    ? path.join(currentDir, "examples")
    : path.join(currentDir, "..", "examples");
}

/**
 * Resolve path to rules directory based on current execution context
 */
export function getRulesPath(currentDir: string): string {
  return isCompiledBuild(currentDir)
    ? path.join(currentDir, "rules")
    : path.join(currentDir, "..", "rules");
}
