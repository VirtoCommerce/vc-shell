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

async function main() {
  const [command, version] = process.argv.slice(2);

  switch (command) {
    case "after-bump":
      await runAfterBump(version);
      return;
    default:
      throw new Error(`Unknown command: ${command ?? "<empty>"}`);
  }
}

main().catch((error: unknown) => {
  console.error("\nRelease hook failed:", error);
  process.exit(1);
});
