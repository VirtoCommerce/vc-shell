import { release } from "@vc-shell/release-config";
import { sync } from "cross-spawn";

release({
  packages: ["."],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    const bumpArgs = ["workspace", pkgName, "version", pkgVersion, "--deferred"];
    await sync("yarn", bumpArgs);

    const versionApplyArgs = ["version", "apply", "--all"];
    await sync("yarn", versionApplyArgs);
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
    await sync("npx", changelogArgs, { cwd: workspaceName ? `${workspaceName}` : "." });
  },
});
