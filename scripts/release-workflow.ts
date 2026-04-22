import { spawnSync } from "node:child_process";
import path from "node:path";
import { readdirSync } from "node:fs";
import fs from "fs-extra";
import { releasePackages, type ReleasePackageConfig } from "./release-packages";

function runCommand(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

export function formatFilesWithPrettier(filePaths: string[]) {
  const targets = [...new Set(filePaths)].filter((filePath) => fs.existsSync(filePath));

  if (targets.length === 0) {
    return;
  }

  console.log("\n[changelog] Formatting changelogs with Prettier...");
  runCommand("yarn", ["prettier", "--write", ...targets]);
}

function writeJsonFile(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function trimTrailingEmptyLines(lines: string[]): string[] {
  const trimmed = [...lines];

  while (trimmed.length > 0 && trimmed[trimmed.length - 1].trim() === "") {
    trimmed.pop();
  }

  return trimmed;
}

export function addVersionBumpNotes(content: string, packageName: string): string {
  const lines = content.split(/\r?\n/);
  const versionHeaderIndexes: number[] = [];
  const versionHeaderRegex = /^#{1,2}\s+(?:\[[^\]]+\]|\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\(|\s|$)/;
  const noteRegex = /^\s*\*\*Note:\*\*\s*Version bump only for package(?:\s+.+)?\s*$/;
  const emptyPackageNoteRegex = /^\s*\*\*Note:\*\*\s*Version bump only for package\s*$/;
  const noteLine = `**Note:** Version bump only for package ${packageName}`;
  let changed = false;

  lines.forEach((line, index) => {
    if (versionHeaderRegex.test(line)) {
      versionHeaderIndexes.push(index);
    }
  });

  if (versionHeaderIndexes.length === 0) {
    return content;
  }

  const normalizeSection = (sectionLines: string[]): string[] => {
    const hasBulletItems = sectionLines.some((line) => /^\s*[-*]\s+/.test(line));
    const noteIndexes = sectionLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => noteRegex.test(line))
      .map(({ index }) => index);

    if (hasBulletItems) {
      if (noteIndexes.length === 0) {
        return sectionLines;
      }

      const result = [...sectionLines];

      for (const noteIndex of noteIndexes) {
        if (emptyPackageNoteRegex.test(result[noteIndex])) {
          result[noteIndex] = noteLine;
          changed = true;
        }
      }

      return result;
    }

    if (noteIndexes.length > 0) {
      const result = [...sectionLines];

      for (const noteIndex of noteIndexes) {
        if (result[noteIndex].trim() !== noteLine) {
          result[noteIndex] = noteLine;
          changed = true;
        }
      }

      return result;
    }

    const hasAnyContent = sectionLines.some((line) => line.trim() !== "");

    if (!hasAnyContent) {
      changed = true;
      return ["", noteLine, ""];
    }

    changed = true;
    return [...trimTrailingEmptyLines(sectionLines), "", noteLine, ""];
  };

  const output: string[] = [];
  let cursor = 0;

  versionHeaderIndexes.forEach((headerIndex, index) => {
    const sectionStart = headerIndex + 1;
    const sectionEnd = versionHeaderIndexes[index + 1] ?? lines.length;

    output.push(...lines.slice(cursor, sectionStart));
    output.push(...normalizeSection(lines.slice(sectionStart, sectionEnd)));
    cursor = sectionEnd;
  });

  if (cursor < lines.length) {
    output.push(...lines.slice(cursor));
  }

  if (!changed) {
    return content;
  }

  const hadTrailingNewline = /\r?\n$/.test(content);
  let updated = output.join("\n");

  if (hadTrailingNewline && !updated.endsWith("\n")) {
    updated += "\n";
  }

  return updated;
}

export function syncWorkspacePackageVersions(version: string) {
  console.log(`\n[release] Syncing workspace package versions to ${version}...`);

  for (const pkg of releasePackages) {
    const packageJsonPath = path.resolve(pkg.path, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`  - Skipping ${pkg.path} (package.json not found)`);
      continue;
    }

    const packageJson = fs.readJsonSync(packageJsonPath);

    if (packageJson.version === version) {
      continue;
    }

    packageJson.version = version;

    // Update @vc-shell/* peerDependencies to match the new version
    if (packageJson.peerDependencies) {
      for (const dep of Object.keys(packageJson.peerDependencies)) {
        if (dep.startsWith("@vc-shell/")) {
          packageJson.peerDependencies[dep] = `^${version}`;
        }
      }
    }

    writeJsonFile(packageJsonPath, packageJson);

    console.log(`  + ${pkg.displayName}`);
  }
}

function generateChangelogForPath(targetPath: string, releaseCount: number) {
  const changelogPath = path.join(targetPath, "CHANGELOG.md");
  const args = [
    "-p",
    "angular",
    "-i",
    changelogPath,
    "-s",
    "-r",
    String(releaseCount),
    "-t",
    "v",
    "--commit-path",
    targetPath,
  ];

  runCommand("conventional-changelog", args);
}

function addVersionBumpNotesToChangelog(targetPath: string, packageName: string) {
  const changelogPath = path.join(targetPath, "CHANGELOG.md");

  if (!fs.existsSync(changelogPath)) {
    return;
  }

  const originalContent = fs.readFileSync(changelogPath, "utf8");
  const updatedContent = addVersionBumpNotes(originalContent, packageName);

  if (updatedContent !== originalContent) {
    fs.writeFileSync(changelogPath, updatedContent);
  }
}

function generateChangelogForPackage(pkg: ReleasePackageConfig, releaseCount: number) {
  generateChangelogForPath(pkg.path, releaseCount);
  addVersionBumpNotesToChangelog(pkg.path, pkg.packageName);
}

export function generatePackageChangelogs(releaseCount: number) {
  console.log("\n[changelog] Generating package changelogs...");
  const changelogFiles: string[] = [];

  for (const pkg of releasePackages) {
    console.log(`  -> ${pkg.displayName}`);
    generateChangelogForPackage(pkg, releaseCount);
    changelogFiles.push(path.join(pkg.path, "CHANGELOG.md"));
  }

  formatFilesWithPrettier(changelogFiles);
}

export function generateRootChangelog(releaseCount: number) {
  console.log("\n[changelog] Generating root changelog...");

  runCommand("conventional-changelog", [
    "-p",
    "angular",
    "-i",
    "CHANGELOG.md",
    "-s",
    "-r",
    String(releaseCount),
    "-t",
    "v",
  ]);

  formatFilesWithPrettier(["CHANGELOG.md"]);
}

const SKILL_DIR = path.resolve("cli/vc-app-skill");
const SKILL_VERSION_FILE = path.join(SKILL_DIR, "runtime/VERSION");
const SKILL_KNOWLEDGE_DOCS = path.join(SKILL_DIR, "runtime/knowledge/docs");
const FRAMEWORK_DIR = path.resolve("framework");

export function syncSkillVersion(version: string) {
  console.log("\n[release] Syncing vc-app-skill assets...");

  if (!fs.existsSync(SKILL_VERSION_FILE)) {
    console.log("  - Skipping VERSION sync (file not found)");
    return;
  }

  fs.writeFileSync(SKILL_VERSION_FILE, `${version}\n`);
  console.log(`  + VERSION → ${version}`);
}

export function syncSkillDocs() {
  if (!fs.existsSync(FRAMEWORK_DIR)) {
    console.log("  - Skipping docs sync (framework directory not found)");
    return;
  }

  fs.removeSync(SKILL_KNOWLEDGE_DOCS);
  fs.mkdirpSync(SKILL_KNOWLEDGE_DOCS);

  const entries = readdirSync(FRAMEWORK_DIR, { recursive: true, encoding: "utf8" });
  let count = 0;

  for (const entry of entries) {
    if (typeof entry === "string" && entry.endsWith(".docs.md")) {
      const src = path.join(FRAMEWORK_DIR, entry);
      const dest = path.join(SKILL_KNOWLEDGE_DOCS, entry);

      fs.mkdirpSync(path.dirname(dest));
      fs.copyFileSync(src, dest);
      count++;
    }
  }

  let hash = "unknown";
  const gitResult = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });

  if (gitResult.status === 0 && gitResult.stdout) {
    hash = gitResult.stdout.trim();
  }

  fs.writeFileSync(
    path.join(SKILL_KNOWLEDGE_DOCS, "_BUILD_HASH.md"),
    `Synced from framework at commit ${hash} on ${new Date().toISOString()}\n`,
  );

  console.log(`  + Synced ${count} docs files (commit: ${hash})`);
}
