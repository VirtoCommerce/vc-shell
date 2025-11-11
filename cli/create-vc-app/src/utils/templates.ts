import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Finds the templates directory by searching multiple possible paths.
 * Works for both src/ and dist/ directory structures.
 *
 * @param currentFileUrl - import.meta.url of the calling file
 * @returns Absolute path to the templates directory
 * @throws Error if templates directory is not found
 */
export function findTemplateRoot(currentFileUrl: string): string {
  // Get the directory of the current file
  const currentDir = path.dirname(fileURLToPath(currentFileUrl));

  // Try different levels up to find templates directory
  // Works for both src/ and dist/ structures
  const possiblePaths = [
    path.resolve(currentDir, "..", "..", "templates"), // From src/commands, src/workflows, dist/commands, dist/workflows
    path.resolve(currentDir, "..", "templates"),       // From src/, dist/ (fallback)
    path.resolve(currentDir, "templates"),             // From root (fallback)
  ];

  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
  }

  throw new Error(
    `Templates directory not found. Searched in:\n${possiblePaths.map((p) => `  - ${p}`).join("\n")}`
  );
}
