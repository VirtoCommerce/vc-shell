import { updateAppsDependencies, updateBoilerplatePkgVersions } from "./utils";
import {
  generatePackageChangelogs,
  syncSkillDocs,
  syncSkillVersion,
  syncWorkspacePackageVersions,
} from "./release-workflow";

async function runAfterBump(version: string) {
  if (!version) {
    throw new Error("Missing version argument. Usage: tsx scripts/release-hooks.ts after-bump <version>");
  }

  syncWorkspacePackageVersions(version);
  await updateBoilerplatePkgVersions();
  await updateAppsDependencies();
  syncSkillVersion(version);
  syncSkillDocs();
  generatePackageChangelogs(1);
}

async function runBeforeRelease(version: string) {
  if (!version) {
    throw new Error("Missing version argument. Usage: tsx scripts/release-hooks.ts before-release <version>");
  }

  const isPrerelease = /-(alpha|beta|rc)\./i.test(version);
  if (isPrerelease) {
    return;
  }

  const { spawnSync } = await import("node:child_process");
  const fs = await import("node:fs");
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

  if (!lastStableTag) {
    console.log("[before-release] No previous stable tag found; using default plugin behavior.");
    return;
  }

  console.log(`[before-release] Consolidating CHANGELOG from ${lastStableTag} to HEAD`);

  const stream = conventionalChangelog(
    {
      preset: "angular",
      tagPrefix: "v",
    },
    { version },
    { from: lastStableTag },
  );

  let newSection = "";
  for await (const chunk of stream) {
    newSection += chunk.toString();
  }

  const existing = fs.readFileSync("CHANGELOG.md", "utf8");
  const header = "# Changelog\n\n";
  const body = existing.startsWith(header) ? existing.slice(header.length) : existing;
  fs.writeFileSync("CHANGELOG.md", header + newSection + body);

  console.log("[before-release] CHANGELOG.md consolidated");
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
