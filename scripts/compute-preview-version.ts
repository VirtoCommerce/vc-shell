import { readFileSync } from "node:fs";
import { syncWorkspacePackageVersions } from "./release-workflow";

function main() {
  const [prNumberArg, shaArg] = process.argv.slice(2);

  if (!prNumberArg || !shaArg) {
    throw new Error("Usage: tsx scripts/compute-preview-version.ts <pr-number> <sha>");
  }

  const prNumber = prNumberArg.replace(/[^0-9]/g, "");
  if (!prNumber) {
    throw new Error(`Invalid PR number: "${prNumberArg}"`);
  }

  const sha7 = shaArg.slice(0, 7);
  if (!/^[0-9a-f]{7}$/i.test(sha7)) {
    throw new Error(`Invalid sha: "${shaArg}" (expected at least 7 hex chars)`);
  }

  const frameworkPkg = JSON.parse(readFileSync("framework/package.json", "utf8"));
  const currentVersion: string = frameworkPkg.version;

  if (!currentVersion) {
    throw new Error("Could not read version from framework/package.json");
  }

  const previewVersion = `${currentVersion}-pr${prNumber}.${sha7}`;

  console.log(`Current version: ${currentVersion}`);
  console.log(`Preview version: ${previewVersion}`);

  syncWorkspacePackageVersions(previewVersion);

  console.log(`Applied preview version to all workspace manifests.`);

  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    const fs = require("node:fs");
    fs.appendFileSync(githubOutput, `version=${previewVersion}\n`);
  }
}

main();
