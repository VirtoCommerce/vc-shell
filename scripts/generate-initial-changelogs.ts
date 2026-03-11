import { generatePackageChangelogs, generateRootChangelog } from "./release-workflow";

/**
 * Regenerates complete CHANGELOG.md files from all commits.
 */

try {
  generatePackageChangelogs(0);
  generateRootChangelog(0);
  console.log("\nFull changelog regeneration completed");
} catch (error: unknown) {
  console.error("\nError generating changelogs:", error);
  process.exit(1);
}
