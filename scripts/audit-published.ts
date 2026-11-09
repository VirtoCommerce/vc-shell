/**
 * Audits the runtime dependency tree of every published workspace and fails
 * on any high or critical advisory. Private workspaces and devDependencies are
 * skipped: they never reach the apps that install @vc-shell/* packages.
 *
 * Every workspace is audited even after a failure, so one run shows the whole
 * list. An advisory with no fix can be accepted with `npmAuditIgnoreAdvisories`
 * in .yarnrc.yml; add a comment there saying why.
 *
 * Usage: yarn check:audit
 */

import { execFileSync, spawnSync } from "node:child_process";

const SEVERITY = "high";

const workspaces = execFileSync("yarn", ["workspaces", "list", "--json", "--no-private"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line) as { name: string; location: string })
  .filter((ws) => ws.location !== ".");

const failed: string[] = [];

for (const { name } of workspaces) {
  console.log(`\n=== ${name}`);
  const result = spawnSync(
    "yarn",
    ["workspace", name, "npm", "audit", "--recursive", "--environment", "production", "--severity", SEVERITY],
    { stdio: "inherit" },
  );
  if (result.status !== 0) failed.push(name);
}

if (failed.length) {
  console.error(`\n${failed.length} package(s) have ${SEVERITY}+ advisories in runtime dependencies:`);
  for (const name of failed) console.error(`  - ${name}`);
  process.exit(1);
}

console.log(`\nNo ${SEVERITY}+ advisories in runtime dependencies of ${workspaces.length} published packages.`);
