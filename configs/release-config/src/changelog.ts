import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { rcompare, valid } from "semver";
import type { PackageConfig, RootChangelogOptions } from "@release-config/types";

// ── Lerna boilerplate cleanup ──────────────────────────────────────────

/**
 * Removes Lerna auto-generated headers and boilerplate from changelog content.
 */
export function cleanChangelogContent(content: string): string {
  let cleaned = content;
  cleaned = cleaned.replace(/^# CHANGELOG\s*\n/gm, "");
  cleaned = cleaned.replace(/^# Change Log\s*\n/gm, "");
  cleaned = cleaned.replace(
    /^All notable changes to this (project|package) will be documented in this file\.\s*\n/gm,
    "",
  );
  cleaned = cleaned.replace(
    /^See \[Conventional Commits\]\(https:\/\/conventionalcommits\.org\) for commit guidelines\.\s*\n/gm,
    "",
  );
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned;
}

/**
 * Adds "Version bump only" notes for version headers with no content beneath them.
 */
export function addVersionBumpNotes(content: string): string {
  return content.replace(
    /^(##\s+\[[^\]]+\][^\n]*\n)\n(##\s+\[|$)/gm,
    "$1\n**Note:** Version bump only for package\n\n$2",
  );
}

// ── Package changelog enhancement ──────────────────────────────────────

/**
 * Cleans up and enhances changelogs for all packages after Lerna version bump.
 */
export function enhancePackageChangelogs(packages: PackageConfig[], dryRun = false): void {
  console.log(chalk.cyan("\nEnhancing changelogs...\n"));

  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    let content = readFileSync(changelogPath, "utf-8");
    content = cleanChangelogContent(content);
    content = addVersionBumpNotes(content);
    content = content.trim() + "\n";

    if (!dryRun) {
      writeFileSync(changelogPath, content, "utf-8");
    }
  }
}

// ── Changelog parsing ──────────────────────────────────────────────────

interface ParsedChangelog {
  /** Map of version string → content lines (without the ## header) */
  versionContent: Record<string, string>;
  /** Map of version string → original header text (without "## " prefix) */
  versionHeaders: Record<string, string>;
}

/**
 * Parses a CHANGELOG.md into a map of version → content.
 */
function parseChangelogVersions(content: string): ParsedChangelog {
  const versionContent: Record<string, string> = {};
  const versionHeaders: Record<string, string> = {};
  const lines = content.split("\n");

  let currentVersion: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const versionMatch = line.match(/^##\s+(?:\[)?([\d.a-z-]+)(?:\])?(?:\s+\([^)]+\))?/i);

    if (versionMatch) {
      // Save previous version
      if (currentVersion && currentContent.length > 0) {
        versionContent[currentVersion] = currentContent.join("\n").trim();
      }

      currentVersion = versionMatch[1];
      currentContent = [];

      // Store original header (first one wins)
      if (!versionHeaders[currentVersion]) {
        versionHeaders[currentVersion] = line.replace(/^##\s+/, "");
      }
    } else if (currentVersion && line.trim() !== "") {
      // Skip Lerna boilerplate lines
      if (
        !line.startsWith("# CHANGELOG") &&
        !line.startsWith("# Change Log") &&
        !line.startsWith("All notable changes") &&
        !line.startsWith("See [Conventional Commits]")
      ) {
        currentContent.push(line);
      }
    }
  }

  // Save last version
  if (currentVersion && currentContent.length > 0) {
    versionContent[currentVersion] = currentContent.join("\n").trim();
  }

  return { versionContent, versionHeaders };
}

// ── Version sorting ────────────────────────────────────────────────────

/**
 * Sorts version strings in descending order using semver.rcompare.
 * Falls back to string comparison for non-semver strings.
 */
export function sortVersionsDescending(versions: string[]): string[] {
  return [...versions].sort((a, b) => {
    if (valid(a) && valid(b)) {
      return rcompare(a, b);
    }
    return b.localeCompare(a);
  });
}

// ── Root changelog generation ──────────────────────────────────────────

/**
 * Generates a consolidated root CHANGELOG.md from package changelogs,
 * grouped by version with sub-headings per package.
 */
export function generateRootChangelog(options: RootChangelogOptions, dryRun = false): void {
  const { packages, rootDir = process.cwd(), includeRootHeader = false } = options;

  console.log(chalk.cyan("\nGenerating root CHANGELOG with package grouping...\n"));

  const rootChangelogPath = path.join(rootDir, "CHANGELOG.md");

  // Collect versions and changes from package changelogs
  const versionChanges: Record<string, Record<string, string>> = {};
  const versionHeaders: Record<string, string> = {};

  for (const pkg of packages) {
    const pkgChangelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");
    if (!existsSync(pkgChangelogPath)) continue;

    const content = readFileSync(pkgChangelogPath, "utf-8");
    const parsed = parseChangelogVersions(content);

    for (const [version, vContent] of Object.entries(parsed.versionContent)) {
      if (!versionChanges[version]) {
        versionChanges[version] = {};
      }
      versionChanges[version][pkg.displayName] = vContent;

      if (!versionHeaders[version] && parsed.versionHeaders[version]) {
        versionHeaders[version] = parsed.versionHeaders[version];
      }
    }
  }

  // Build root changelog
  let rootContent = "";

  if (includeRootHeader) {
    rootContent = `# CHANGELOG\n\nAll notable changes to this monorepo will be documented in this file.\n\n`;
  }

  const allVersions = sortVersionsDescending(Object.keys(versionChanges));

  for (const version of allVersions) {
    const changes = versionChanges[version];

    // Check if version has real changes (not just "Version bump only")
    const hasRealChanges = Object.values(changes).some((content) => {
      if (!content || !content.trim()) return false;
      const withoutNotes = content.replace(/\*\*Note:\*\*\s+Version bump only[^\n]*/gi, "").trim();
      return withoutNotes.length > 0;
    });

    const versionHeader = versionHeaders[version] || version;
    rootContent += `## ${versionHeader}\n\n`;

    if (!hasRealChanges) {
      rootContent += `**Note:** Version bump only for package\n\n`;
      continue;
    }

    // Group by package (only packages with real changes)
    let addedAnyPackage = false;
    for (const pkg of packages) {
      const pkgContent = changes[pkg.displayName];
      if (pkgContent && pkgContent.trim()) {
        const withoutNotes = pkgContent.replace(/\*\*Note:\*\*\s+Version bump only[^\n]*/gi, "").trim();
        if (withoutNotes.length > 0) {
          addedAnyPackage = true;
          rootContent += `### ${pkg.displayName}\n\n`;
          rootContent += `${pkgContent}\n\n`;
        }
      }
    }

    if (!addedAnyPackage) {
      rootContent += `**Note:** Version bump only for package\n\n`;
    }
  }

  rootContent = rootContent.replace(/\n{3,}/g, "\n\n");
  rootContent = rootContent.trim() + "\n";

  if (!dryRun) {
    writeFileSync(rootChangelogPath, rootContent, "utf-8");
    console.log(chalk.green("  Generated root CHANGELOG.md with package grouping"));
  } else {
    console.log(chalk.yellow(`  [dry-run] Would write root CHANGELOG.md (${allVersions.length} versions)`));
  }
}
