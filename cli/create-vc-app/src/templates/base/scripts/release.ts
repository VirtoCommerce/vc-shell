import { release } from "@vc-shell/release-config";
import { spawnSync } from "child_process";

release({
  packages: ["."],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    const bumpArgs = ["workspace", pkgName, "version", pkgVersion, "--deferred"];
    await spawnSync("yarn", bumpArgs);

    const versionApplyArgs = ["version", "apply", "--all"];
    await spawnSync("yarn", versionApplyArgs);
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
    await spawnSync("npx", changelogArgs, { cwd: workspaceName ? `${workspaceName}` : "." });
  },
});
