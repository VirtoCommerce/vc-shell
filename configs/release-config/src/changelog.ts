import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { rcompare, valid } from "semver";
import type { PackageConfig, RootChangelogOptions } from "@release-config/types";
import {
  getRepoUrl,
  isAncestorOfHead,
  getMergeBase,
  tagExists,
  getConventionalCommitsInRange,
  getAllVersionTags,
  getPreviousVersionTag,
  type ConventionalCommit,
} from "@release-config/git";

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

/**
 * Ensures each package has an entry for the current release version.
 * If Lerna skipped a package because it had no direct changes, we still add
 * a placeholder section for the version so lockstep releases stay aligned.
 */
export function ensureCurrentVersionEntries(
  packages: PackageConfig[],
  version: string,
  dryRun = false,
): void {
  console.log(chalk.cyan(`\nEnsuring current version entries for ${version}...\n`));

  let inserted = 0;

  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    let content = readFileSync(changelogPath, "utf-8");
    const versionRegex = new RegExp(`^##\\s+\\[?${version.replace(/\./g, "\\.")}\\]?\\b`, "m");

    if (versionRegex.test(content)) continue;

    const newEntry = `## ${version}\n\n**Note:** Version bump only for package\n\n`;
    const firstVersionHeader = content.match(/^##\s+\[?[\d.a-z-]+\]?[^\n]*/m);

    if (firstVersionHeader && firstVersionHeader.index !== undefined) {
      content =
        content.substring(0, firstVersionHeader.index) +
        newEntry +
        content.substring(firstVersionHeader.index);
    } else if (content.trim()) {
      content = content.trimEnd() + "\n\n" + newEntry;
    } else {
      content = newEntry;
    }

    inserted++;

    if (!dryRun) {
      writeFileSync(changelogPath, content, "utf-8");
    }
  }

  if (inserted > 0) {
    console.log(chalk.green(`  Inserted ${inserted} current version entr${inserted === 1 ? "y" : "ies"}`));
  } else {
    console.log(chalk.gray("  All packages already have a current version entry"));
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

// ── Backfill empty versions ─────────────────────────────────────────────

/** Changelog-worthy commit types and their headings */
const CHANGELOG_TYPES: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance Improvements",
  revert: "Reverts",
};

/**
 * Resolves the effective commit ref for a version tag, handling cases
 * where the tag is not an ancestor of HEAD (e.g., after force-push/rebase).
 */
function resolveVersionRef(tag: string): string | null {
  if (!tagExists(tag)) return null;
  if (isAncestorOfHead(tag)) return tag;
  return getMergeBase(tag, "HEAD");
}

/**
 * Formats conventional commits as markdown changelog entries.
 */
function formatCommitsAsChangelog(commits: ConventionalCommit[], repoUrl: string | null): string {
  const grouped: Record<string, ConventionalCommit[]> = {};

  for (const commit of commits) {
    const heading = CHANGELOG_TYPES[commit.type];
    if (!heading) continue;
    if (!grouped[heading]) grouped[heading] = [];
    grouped[heading].push(commit);
  }

  if (Object.keys(grouped).length === 0) return "";

  let content = "";
  const order = ["Features", "Bug Fixes", "Performance Improvements", "Reverts"];

  for (const heading of order) {
    const group = grouped[heading];
    if (!group || group.length === 0) continue;

    content += `### ${heading}\n\n`;
    for (const c of group) {
      const hashLink = repoUrl
        ? `([${c.shortHash}](${repoUrl}/commit/${c.hash}))`
        : `(${c.shortHash})`;
      content += c.scope
        ? `- **${c.scope}:** ${c.subject} ${hashLink}\n`
        : `- ${c.subject} ${hashLink}\n`;
    }
    content += "\n";
  }

  return content.trim();
}

/**
 * Scans package changelogs for "Version bump only" entries and fills them
 * with actual conventional commit content from git history.
 *
 * Handles non-ancestor tags (after rebase/force-push) by resolving via merge-base.
 * Deduplicates against commits already present in the changelog.
 */
export function backfillEmptyVersions(
  packages: PackageConfig[],
  tagPrefix: string,
  dryRun = false,
): void {
  console.log(chalk.cyan("\nBackfilling empty changelog versions...\n"));

  const repoUrl = getRepoUrl();
  let backfilled = 0;

  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    let content = readFileSync(changelogPath, "utf-8");

    const bumpPattern = /^(##\s+\[?([\d.a-z-]+)\]?[^\n]*\n)\n\*\*Note:\*\*\s+Version bump only[^\n]*/gm;

    let modified = false;

    content = content.replace(bumpPattern, (match, header: string, version: string) => {
      // Use git tags (not CHANGELOG entries) to find the correct previous version
      const prevTag = getPreviousVersionTag(version, tagPrefix);
      if (!prevTag) return match;

      const fromRef = resolveVersionRef(prevTag);
      if (!fromRef) return match;

      // "to" = this version's tag (or HEAD as fallback)
      let toRef = resolveVersionRef(`${tagPrefix}${version}`);
      if (!toRef) toRef = "HEAD";

      if (fromRef === toRef) return match;

      const commits = getConventionalCommitsInRange(fromRef, toRef, pkg.path);

      // Dedup: skip commits whose short hash already appears in the changelog
      const unique = commits.filter((c) => !content.includes(c.shortHash));
      const formatted = formatCommitsAsChangelog(unique, repoUrl);
      if (!formatted) return match;

      modified = true;
      backfilled++;
      console.log(chalk.gray(`  Backfilled ${pkg.name} v${version} (${unique.length} commits)`));
      return `${header}\n${formatted}`;
    });

    if (modified && !dryRun) {
      writeFileSync(changelogPath, content, "utf-8");
    }
  }

  if (backfilled > 0) {
    console.log(chalk.green(`  Backfilled ${backfilled} empty changelog version(s)`));
  } else {
    console.log(chalk.gray("  No empty versions to backfill"));
  }
}

/**
 * Removes duplicate commit entries across changelog versions.
 * Each commit should only appear in the oldest version that contains it.
 * This handles cases where Lerna attributes commits to a new version
 * that were already recorded in backfilled older versions.
 */
export function deduplicateChangelog(packages: PackageConfig[], dryRun = false): void {
  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    const content = readFileSync(changelogPath, "utf-8");

    // Split into version sections
    const sections: { header: string; body: string }[] = [];
    const versionRegex = /^(##\s+\[?[\d.a-z-]+\]?[^\n]*)\n/gm;
    let lastIdx = 0;
    let lastHeader = "";

    for (const m of content.matchAll(versionRegex)) {
      if (lastHeader) {
        sections.push({ header: lastHeader, body: content.substring(lastIdx, m.index) });
      }
      lastHeader = m[1];
      lastIdx = m.index! + m[0].length;
    }
    if (lastHeader) {
      sections.push({ header: lastHeader, body: content.substring(lastIdx) });
    }

    if (sections.length < 2) continue;

    // Collect commit hashes from older sections (index 1+)
    const hashPattern = /\[([a-f0-9]{7})\]\(/g;
    const olderHashes = new Set<string>();

    for (let i = 1; i < sections.length; i++) {
      for (const m of sections[i].body.matchAll(hashPattern)) {
        olderHashes.add(m[1]);
      }
    }

    if (olderHashes.size === 0) continue;

    // Remove duplicate lines from newest section (index 0)
    const originalBody = sections[0].body;
    const filteredLines = originalBody.split("\n").filter((line) => {
      if (!line.startsWith("- ")) return true;
      const lineHash = line.match(/\[([a-f0-9]{7})\]\(/);
      return !lineHash || !olderHashes.has(lineHash[1]);
    });

    const newBody = filteredLines.join("\n");
    if (newBody === originalBody) continue;

    sections[0].body = newBody;

    // Rebuild the file
    let rebuilt = "";
    for (const s of sections) {
      rebuilt += `${s.header}\n${s.body}`;
    }
    rebuilt = rebuilt.replace(/\n{3,}/g, "\n\n").trim() + "\n";

    // Check if the newest section is now empty of real content
    const newestContent = sections[0].body.replace(/###[^\n]*/g, "").trim();
    if (!newestContent) {
      // Replace body with bump note
      rebuilt = rebuilt.replace(
        sections[0].body,
        "\n**Note:** Version bump only for package\n\n",
      );
    }

    if (!dryRun) {
      writeFileSync(changelogPath, rebuilt, "utf-8");
    }

    const removed = originalBody.split("\n").length - filteredLines.length;
    if (removed > 0) {
      console.log(chalk.gray(`  Deduplicated ${pkg.name}: removed ${removed} duplicate entries`));
    }
  }
}

// ── Insert missing version entries ──────────────────────────────────────

/**
 * Inserts missing version entries into package CHANGELOGs.
 *
 * In Lerna fixed-mode, packages with no changes sometimes don't get
 * a CHANGELOG entry even though a version tag exists. This function
 * compares git tags with CHANGELOG headers and inserts missing entries
 * with a "Version bump only" placeholder, so that `backfillEmptyVersions`
 * can then attempt to fill them with actual commits.
 */
export function insertMissingVersionEntries(
  packages: PackageConfig[],
  tagPrefix: string,
  dryRun = false,
): void {
  console.log(chalk.cyan("\nInserting missing version entries...\n"));

  const allTags = getAllVersionTags(tagPrefix);
  // Extract version strings from tags
  const allTagVersions = allTags
    .map((t) => (t.startsWith(tagPrefix) ? t.slice(tagPrefix.length) : t))
    .filter((v) => valid(v));

  let inserted = 0;

  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    let content = readFileSync(changelogPath, "utf-8");

    // Collect versions already present in CHANGELOG
    const existingVersions = new Set<string>();
    for (const m of content.matchAll(/^##\s+\[?([\d.a-z-]+)\]?/gim)) {
      existingVersions.add(m[1]);
    }

    // Find versions present in git tags but missing from CHANGELOG
    const missingVersions = allTagVersions.filter((v) => !existingVersions.has(v));
    if (missingVersions.length === 0) continue;

    // Insert each missing version in the correct position (sorted descending)
    for (const missingVer of missingVersions) {
      // Find the first existing version header that is OLDER than missingVer
      // and insert before it (so the missing version appears above the older one)
      const versionHeaderRegex = /^##\s+\[?([\d.a-z-]+)\]?[^\n]*/gim;
      let insertIdx = -1;

      for (const m of content.matchAll(versionHeaderRegex)) {
        const existingVer = m[1];
        if (valid(existingVer) && valid(missingVer)) {
          // If missingVer is newer than existingVer, insert before it (CHANGELOG is newest-first)
          if (rcompare(missingVer, existingVer) > 0) {
            insertIdx = m.index!;
            break;
          }
        }
      }

      const newEntry = `## ${missingVer}\n\n**Note:** Version bump only for package\n\n`;

      if (insertIdx !== -1) {
        content = content.substring(0, insertIdx) + newEntry + content.substring(insertIdx);
      } else {
        // All existing versions are newer — append at the end
        content = content.trimEnd() + "\n\n" + newEntry;
      }

      inserted++;
      console.log(chalk.gray(`  Inserted missing ${pkg.name} v${missingVer}`));
    }

    content = content.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

    if (!dryRun) {
      writeFileSync(changelogPath, content, "utf-8");
    }
  }

  if (inserted > 0) {
    console.log(chalk.green(`  Inserted ${inserted} missing version entries`));
  } else {
    console.log(chalk.gray("  No missing version entries to insert"));
  }
}

// ── Supplement incomplete versions ──────────────────────────────────────

/**
 * Supplements version sections that have SOME content but are missing commits
 * present in the git tag range.
 *
 * For each version section with content, compares commit short hashes in the
 * CHANGELOG against commits in the actual git range (previous_tag..version_tag).
 * Appends any missing commits to the existing section.
 *
 * This handles the case where Lerna recorded some commits but the tag includes
 * additional commits made after the CHANGELOG was generated (e.g. post-release
 * fixes amended into the release commit).
 */
export function supplementIncompleteVersions(
  packages: PackageConfig[],
  tagPrefix: string,
  dryRun = false,
): void {
  console.log(chalk.cyan("\nSupplementing incomplete changelog versions...\n"));

  const repoUrl = getRepoUrl();
  let supplemented = 0;

  for (const pkg of packages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    if (!existsSync(changelogPath)) continue;

    let content = readFileSync(changelogPath, "utf-8");
    let modified = false;

    // Parse version sections
    const versionRegex = /^(##\s+\[?([\d.a-z-]+)\]?[^\n]*)\n/gm;
    const sections: { header: string; version: string; startIdx: number; endIdx: number }[] = [];

    for (const m of content.matchAll(versionRegex)) {
      sections.push({
        header: m[1],
        version: m[2],
        startIdx: m.index!,
        endIdx: m.index! + m[0].length,
      });
    }

    // Process sections from last to first (so index shifts don't affect earlier sections)
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEnd = i < sections.length - 1 ? sections[i + 1].startIdx : content.length;
      const sectionBody = content.substring(section.endIdx, sectionEnd);

      // Skip "Version bump only" sections (handled by backfillEmptyVersions)
      if (sectionBody.includes("Version bump only")) continue;
      // Skip empty sections
      if (!sectionBody.trim()) continue;

      // Find git range for this version
      const prevTag = getPreviousVersionTag(section.version, tagPrefix);
      if (!prevTag) continue;

      const fromRef = resolveVersionRef(prevTag);
      if (!fromRef) continue;

      let toRef = resolveVersionRef(`${tagPrefix}${section.version}`);
      if (!toRef) continue;

      if (fromRef === toRef) continue;

      const commits = getConventionalCommitsInRange(fromRef, toRef, pkg.path);
      // Find commits not already in this section (by short hash)
      const missingCommits = commits.filter((c) => !sectionBody.includes(c.shortHash));

      if (missingCommits.length === 0) continue;

      const formatted = formatCommitsAsChangelog(missingCommits, repoUrl);
      if (!formatted) continue;

      // Append missing commits to the section body
      const trimmedBody = sectionBody.trimEnd();
      const newSectionBody = trimmedBody + "\n\n" + formatted + "\n\n";
      content = content.substring(0, section.endIdx) + newSectionBody + content.substring(sectionEnd);

      modified = true;
      supplemented++;
      console.log(
        chalk.gray(`  Supplemented ${pkg.name} v${section.version} (+${missingCommits.length} commits)`),
      );
    }

    if (modified) {
      content = content.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
      if (!dryRun) {
        writeFileSync(changelogPath, content, "utf-8");
      }
    }
  }

  if (supplemented > 0) {
    console.log(chalk.green(`  Supplemented ${supplemented} incomplete changelog version(s)`));
  } else {
    console.log(chalk.gray("  No incomplete versions to supplement"));
  }
}
