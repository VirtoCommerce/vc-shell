import { release } from "@vc-shell/release-config";
import { spawnSync } from "child_process";
import { updateBoilerplatePkgVersions } from "./utils";

release({
  packages: [
    ".", // root
    "framework",
    "cli/api-client",
    "cli/config",
    "cli/create-vc-app",
    "configs/release-config",
    "configs/ts-config",
    "sample/vc-app",
    "sample/vc-app-extend",
  ],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    const bumpArgs = ["workspace", pkgName, "version", pkgVersion, "--deferred"];
    await spawnSync("yarn", bumpArgs);

    const versionApplyArgs = ["version", "apply", "--all"];
    await spawnSync("yarn", versionApplyArgs);
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    if (pkgName === "@vc-shell/create-vc-app") await updateBoilerplatePkgVersions();

    const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
    await spawnSync("npx", changelogArgs, { cwd: workspaceName ? `${workspaceName}` : "." });
  },
});
