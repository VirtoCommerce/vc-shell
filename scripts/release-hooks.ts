import { updateAppsDependencies, updateBoilerplatePkgVersions } from "./utils";
import {
  addVersionBumpNotes,
  formatFilesWithPrettier,
  generatePackageChangelogs,
  syncSkillDocs,
  syncSkillVersion,
  syncWorkspacePackageVersions,
} from "./release-workflow";
import { releasePackages } from "./release-packages";

function escapeGitHubMentions(text: string): string {
  return text.replace(/@([\w-]+(?:\/[\w-]+)*)/g, "`@$1`");
}

const COMMIT_TYPE_TITLES: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance Improvements",
  revert: "Reverts",
  docs: "Documentation",
  style: "Styles",
  refactor: "Code Refactoring",
  test: "Tests",
  build: "Build System",
  ci: "Continuous Integration",
  chore: "Chores",
};

const COMMIT_GROUP_ORDER: Record<string, number> = {
  "BREAKING CHANGES": 0,
  Features: 1,
  "Bug Fixes": 2,
  "Performance Improvements": 3,
  Reverts: 4,
  "Code Refactoring": 5,
  Documentation: 6,
  "Build System": 7,
  "Continuous Integration": 8,
  Tests: 9,
  Styles: 10,
  Chores: 11,
  "Other Changes": 12,
};

function isPrereleaseVersion(version: string): boolean {
  return /-(alpha|beta|rc)\./i.test(version);
}

async function runAfterBump(version: string) {
  if (!version) {
    throw new Error("Missing version argument. Usage: tsx scripts/release-hooks.ts after-bump <version>");
  }

  syncWorkspacePackageVersions(version);
  await updateBoilerplatePkgVersions();
  // TODO remove this once we have a way to update apps dependencies automatically
  await updateAppsDependencies();
  syncSkillVersion(version);
  syncSkillDocs();

  if (isPrereleaseVersion(version)) {
    generatePackageChangelogs(1);
    return;
  }

  // Stable releases must consolidate all prerelease commits into one section.
  await consolidateStableChangelogs(version, false);
}

function stripPrereleaseEntries(body: string, currentVersion: string): string {
  const headerRegex =
    /^#{1,2}\s+(?:\[(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\](?:\([^)]+\))?|(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?))(?:\s|$)/gm;
  const headers: { index: number; version: string }[] = [];
  let match;

  while ((match = headerRegex.exec(body)) !== null) {
    const version = match[1] ?? match[2];
    if (version) {
      headers.push({ index: match.index, version });
    }
  }

  if (headers.length === 0) return body;

  let result = body.slice(0, headers[0].index);

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : body.length;
    const ver = headers[i].version;

    const isPrerelease = /-(alpha|beta|rc)/.test(ver);
    const isCurrent = ver === currentVersion;

    if (!isPrerelease && !isCurrent) {
      result += body.slice(start, end);
    }
  }

  return result;
}

async function consolidateStableChangelogs(version: string, stage: boolean): Promise<void> {
  const { spawnSync } = await import("node:child_process");
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { default: conventionalChangelog } = await import("conventional-changelog");

  const tagsResult = spawnSync("git", ["tag", "--sort=-v:refname"], {
    encoding: "utf8",
  });
  if (tagsResult.status !== 0) {
    throw new Error(`git tag failed: ${tagsResult.stderr}`);
  }
  const stablePattern = /^v\d+\.\d+\.\d+$/;
  const lastStableTag = tagsResult.stdout
    .split("\n")
    .map((t) => t.trim())
    .find((t) => stablePattern.test(t));

  let from: string;
  if (lastStableTag) {
    from = lastStableTag;
  } else {
    const rootResult = spawnSync("git", ["rev-list", "--max-parents=0", "HEAD"], {
      encoding: "utf8",
    });
    if (rootResult.status !== 0 || !rootResult.stdout.trim()) {
      throw new Error("Could not determine root commit");
    }
    from = rootResult.stdout.trim().split("\n")[0];
  }

  console.log(`[before-release] Consolidating changelogs from ${lastStableTag || "beginning of history"} to HEAD`);

  async function generateConsolidated(extraGitOpts: Record<string, string> = {}): Promise<string> {
    const writerOpts: any = {
      // Keep all commits in one stable section instead of splitting on alpha/beta/rc tags.
      generateOn: () => false,
      transform: (commit: any) => {
        const notes = Array.isArray(commit.notes)
          ? commit.notes.map((note: any) => ({ ...note, title: "BREAKING CHANGES" }))
          : [];

        const typeKey = typeof commit.type === "string" ? commit.type.toLowerCase() : "";
        const type = COMMIT_TYPE_TITLES[typeKey] ?? (typeKey || "Other Changes");
        const subject =
          typeof commit.subject === "string" && commit.subject.trim()
            ? commit.subject
            : typeof commit.header === "string"
              ? commit.header
              : "";

        if (!subject && notes.length === 0) {
          return undefined;
        }

        return {
          ...commit,
          notes,
          type,
          scope: commit.scope === "*" ? "" : commit.scope,
          shortHash: typeof commit.hash === "string" ? commit.hash.slice(0, 7) : commit.shortHash,
          subject: escapeGitHubMentions(subject),
          references: Array.isArray(commit.references) ? commit.references : [],
        };
      },
      groupBy: "type",
      commitGroupsSort: (a: any, b: any) => {
        const ao = COMMIT_GROUP_ORDER[a.title] ?? 99;
        const bo = COMMIT_GROUP_ORDER[b.title] ?? 99;
        return ao === bo ? String(a.title).localeCompare(String(b.title)) : ao - bo;
      },
      commitsSort: ["scope", "subject"],
    };

    const stream = conventionalChangelog(
      { preset: "angular", tagPrefix: "v" },
      {
        version,
        previousTag: from,
        currentTag: `v${version}`,
      },
      { from, merges: null, ...extraGitOpts },
      undefined,
      writerOpts,
    );
    let content = "";
    for await (const chunk of stream) {
      content += chunk.toString();
    }
    return content;
  }

  function readChangelog(filePath: string): string {
    if (!fs.existsSync(filePath)) return "";
    return fs.readFileSync(filePath, "utf8");
  }

  function extractBody(content: string): string {
    const headerMatch = content.match(/^#\s+Changelog\s*\n+/);
    return headerMatch ? content.slice(headerMatch[0].length) : content;
  }

  const HEADER = "# Changelog\n\n";
  const changelogFiles: string[] = [];

  // 1. Root changelog — consolidated from all prerelease commits
  const rootSection = await generateConsolidated();
  const existingRoot = readChangelog("CHANGELOG.md");
  const cleanRootBody = stripPrereleaseEntries(extractBody(existingRoot), version);
  fs.writeFileSync("CHANGELOG.md", HEADER + rootSection + cleanRootBody);
  changelogFiles.push("CHANGELOG.md");
  console.log("  + Root CHANGELOG.md");

  // 2. Per-package changelogs
  for (const pkg of releasePackages) {
    const changelogPath = path.join(pkg.path, "CHANGELOG.md");
    const pkgSection = await generateConsolidated({ path: pkg.path });
    const existingPkg = readChangelog(changelogPath);
    const cleanPkgBody = stripPrereleaseEntries(extractBody(existingPkg), version);

    let fileContent = HEADER + pkgSection + cleanPkgBody;
    fileContent = addVersionBumpNotes(fileContent, pkg.packageName);

    fs.writeFileSync(changelogPath, fileContent);
    changelogFiles.push(changelogPath);
    console.log(`  + ${pkg.displayName}`);
  }

  formatFilesWithPrettier(changelogFiles);

  if (stage) {
    // before:release runs after initial staging, so restage regenerated changelogs.
    spawnSync("git", ["add", ...changelogFiles], { stdio: "inherit" });
    console.log("[before-release] All changelogs consolidated and staged");
    return;
  }

  console.log("[before-release] All changelogs consolidated");
}

async function runBeforeRelease(version: string) {
  if (!version) {
    throw new Error("Missing version argument. Usage: tsx scripts/release-hooks.ts before-release <version>");
  }

  if (isPrereleaseVersion(version)) {
    return;
  }

  await consolidateStableChangelogs(version, true);
}

async function main() {
  const [command, version] = process.argv.slice(2);

  switch (command) {
    case "after-bump":
      await runAfterBump(version);
      return;
    case "before-release":
      await runBeforeRelease(version);
      return;
    default:
      throw new Error(`Unknown command: ${command ?? "<empty>"}`);
  }
}

main().catch((error: unknown) => {
  console.error("\nRelease hook failed:", error);
  process.exit(1);
});
