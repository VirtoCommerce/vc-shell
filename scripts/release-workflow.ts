import { spawnSync } from "node:child_process";
import path from "node:path";
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

  for (const pkg of releasePackages) {
    console.log(`  -> ${pkg.displayName}`);
    generateChangelogForPackage(pkg, releaseCount);
  }
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
}
