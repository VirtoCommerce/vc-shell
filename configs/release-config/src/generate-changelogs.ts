import { sync } from "cross-spawn";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { generateRootChangelog } from "@release-config/changelog";
import { type ConventionalCommit } from "@release-config/git";
import type { PackageConfig, ChangelogGeneratorOptions } from "@release-config/types";

// Re-export types for backward compatibility (cli-generate-changelogs imports from here)
export type { PackageConfig, ChangelogGeneratorOptions };

const CHANGELOG_SECTIONS: Array<{ heading: string; hidden?: boolean; types: string[] }> = [
  { heading: "Features", types: ["feat"] },
  { heading: "Bug Fixes", types: ["fix"] },
  { heading: "Performance Improvements", types: ["perf"] },
  { heading: "Reverts", types: ["revert"] },
  { heading: "Documentation", types: ["docs"] },
  { heading: "Styles", types: ["style"] },
  { heading: "Code Refactoring", types: ["refactor"] },
  { heading: "Tests", types: ["test"] },
  { heading: "Build System", types: ["build"] },
  { heading: "CI/CD", types: ["ci"] },
  { heading: "Chores", hidden: true, types: ["chore"] },
];

const TYPE_TO_SECTION = new Map<string, { heading: string; hidden?: boolean }>(
  CHANGELOG_SECTIONS.flatMap((section) =>
    section.types.map((type) => [type, { heading: section.heading, hidden: section.hidden }] as const),
  ),
);

function getConventionalCommitsForRelease(
  currentTag: string,
  previousTag: string | null,
  rootDir: string,
  commitPath?: string,
): ConventionalCommit[] {
  const gitArgs = ["log", "--format=%H %s", previousTag ? `${previousTag}..${currentTag}` : currentTag];
  if (commitPath) {
    gitArgs.push("--", commitPath);
  }

  const result = sync("git", gitArgs, {
    stdio: "pipe",
    encoding: "utf-8",
    cwd: rootDir,
  });

  if (result.status !== 0 || !result.stdout) return [];

  const commits: ConventionalCommit[] = [];
  const lines = result.stdout.toString().trim().split("\n").filter(Boolean);
  const pattern = /^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/;

  for (const line of lines) {
    const spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) continue;

    const hash = line.substring(0, spaceIdx);
    const message = line.substring(spaceIdx + 1);
    const match = message.match(pattern);
    if (!match) continue;

    commits.push({
      hash,
      shortHash: hash.substring(0, 7),
      type: match[1],
      scope: match[2] || null,
      subject: match[4],
      breaking: !!match[3],
    });
  }

  return commits;
}

function getAllVersionTags(rootDir: string, prefix: string): string[] {
  const result = sync("git", ["tag", "-l", `${prefix}*`], {
    stdio: "pipe",
    encoding: "utf-8",
    cwd: rootDir,
  });

  if (result.status !== 0 || !result.stdout) return [];

  const tags = result.stdout
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);

  const timestamps = new Map<string, number>();
  for (const tag of tags) {
    timestamps.set(tag, getTagTimestamp(rootDir, tag));
  }

  return tags.sort((a, b) => {
    const aTime = timestamps.get(a) || 0;
    const bTime = timestamps.get(b) || 0;
    if (aTime !== bTime) return bTime - aTime;
    return b.localeCompare(a);
  });
}

function getRepoUrl(rootDir: string): string | null {
  const result = sync("git", ["remote", "get-url", "origin"], {
    stdio: "pipe",
    encoding: "utf-8",
    cwd: rootDir,
  });

  if (result.status !== 0 || !result.stdout) return null;

  return result.stdout
    .toString()
    .trim()
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/");
}

function getTagTimestamp(rootDir: string, tag: string): number {
  const result = sync("git", ["log", "-1", "--format=%ct", tag], {
    stdio: "pipe",
    encoding: "utf-8",
    cwd: rootDir,
  });

  if (result.status === 0 && result.stdout?.trim()) {
    return Number(result.stdout.trim()) || 0;
  }

  return 0;
}

function getTagDate(rootDir: string, tag: string): string {
  const commitDate = sync("git", ["log", "-1", "--format=%cs", tag], {
    stdio: "pipe",
    encoding: "utf-8",
    cwd: rootDir,
  });

  if (commitDate.status === 0 && commitDate.stdout?.trim()) {
    return commitDate.stdout.trim();
  }

  return "";
}

function formatReleaseHeader(
  rootDir: string,
  version: string,
  currentTag: string,
  previousTag: string | null,
  repoUrl: string | null,
): string {
  const date = getTagDate(rootDir, currentTag);

  if (repoUrl && previousTag) {
    return `## [${version}](${repoUrl}/compare/${previousTag}...${currentTag})${date ? ` (${date})` : ""}`;
  }

  return `## ${version}${date ? ` (${date})` : ""}`;
}

function formatCommits(commits: ConventionalCommit[], repoUrl: string | null): string {
  const grouped = new Map<string, ConventionalCommit[]>();
  const breakingCommits: ConventionalCommit[] = [];

  for (const commit of commits) {
    const section = TYPE_TO_SECTION.get(commit.type);
    if (!section || section.hidden) continue;

    if (!grouped.has(section.heading)) {
      grouped.set(section.heading, []);
    }
    grouped.get(section.heading)!.push(commit);

    if (commit.breaking) {
      breakingCommits.push(commit);
    }
  }

  if (grouped.size === 0) {
    return "";
  }

  const lines: string[] = [];

  for (const section of CHANGELOG_SECTIONS) {
    if (section.hidden) continue;
    const sectionCommits = grouped.get(section.heading);
    if (!sectionCommits || sectionCommits.length === 0) continue;

    lines.push(`### ${section.heading}`, "");

    for (const commit of sectionCommits) {
      const hashLink = repoUrl
        ? `([${commit.shortHash}](${repoUrl}/commit/${commit.hash}))`
        : `(${commit.shortHash})`;

      lines.push(
        commit.scope
          ? `- **${commit.scope}:** ${commit.subject} ${hashLink}`
          : `- ${commit.subject} ${hashLink}`,
      );
    }

    lines.push("");
  }

  if (breakingCommits.length > 0) {
    lines.push("### BREAKING CHANGES", "");

    for (const commit of breakingCommits) {
      lines.push(commit.scope ? `- **${commit.scope}:** ${commit.subject}` : `- ${commit.subject}`);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

function generatePackageChangelogContent(
  rootDir: string,
  pkg: PackageConfig,
  tagPrefix: string,
  repoUrl: string | null,
): string {
  const allTags = getAllVersionTags(rootDir, tagPrefix);
  const sections: string[] = [];

  for (let i = 0; i < allTags.length; i++) {
    const currentTag = allTags[i];
    const previousTag = i < allTags.length - 1 ? allTags[i + 1] : null;
    const version = currentTag.startsWith(tagPrefix) ? currentTag.slice(tagPrefix.length) : currentTag;
    const header = formatReleaseHeader(rootDir, version, currentTag, previousTag, repoUrl);
    const commits = getConventionalCommitsForRelease(
      currentTag,
      previousTag,
      rootDir,
      path.join(rootDir, pkg.path),
    );
    const content = formatCommits(commits, repoUrl);

    sections.push(header);
    sections.push("");
    sections.push(content || "**Note:** Version bump only for package");
    sections.push("");
  }

  return sections.join("\n").trim() + "\n";
}

/**
 * Generates CHANGELOG.md files from all commits for specified packages.
 * Used for initial one-time changelog bootstrapping via the CLI tool.
 */
export async function generateInitialChangelogs(options: ChangelogGeneratorOptions): Promise<void> {
  const {
    packages,
    rootDir = process.cwd(),
    generateRoot = true,
    includeRootHeader = true,
    tagVersionPrefix = "v",
  } = options;

  console.log(chalk.cyan("\nGenerating initial CHANGELOG.md files...\n"));
  const repoUrl = getRepoUrl(rootDir);

  for (const pkg of packages) {
    const changelogPath = path.join(rootDir, pkg.path, "CHANGELOG.md");

    // Create backup if file exists
    if (existsSync(changelogPath)) {
      const backupPath = `${changelogPath}.backup`;
      const content = readFileSync(changelogPath, "utf-8");
      writeFileSync(backupPath, content, "utf-8");
      console.log(chalk.gray(`  Backed up ${changelogPath} to ${backupPath}`));
    }

    console.log(chalk.blue(`\nGenerating changelog for ${pkg.name}...`));

    const content = generatePackageChangelogContent(rootDir, pkg, tagVersionPrefix, repoUrl);
    writeFileSync(changelogPath, content, "utf-8");
    console.log(chalk.green(`  Generated ${changelogPath}`));
  }

  if (generateRoot) {
    await generateRootChangelog({ packages, rootDir, includeRootHeader });
  }

  console.log(chalk.green("\nInitial changelogs generated successfully!"));
  console.log(chalk.cyan("\nNext steps:"));
  console.log(chalk.cyan("  1. Review the generated CHANGELOG.md files"));
  console.log(chalk.cyan("  2. Make any manual adjustments if needed"));
  console.log(chalk.cyan("  3. Commit the changes\n"));
}

// Re-export for backward compatibility
export { generateRootChangelog };
