import { release } from "@vc-shell/release-config";
import { sync } from "cross-spawn";
import { updateBoilerplatePkgVersions } from "./utils";

release({
  packages: [
    ".", // root
    "framework",
    "cli/api-client",
    "cli/create-vc-app",
    "configs/release-config",
    "configs/vite-config",
    "configs/ts-config",
    "sample/vc-app",
    "sample/vc-app-extend",
  ],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    const bumpArgs = ["workspace", pkgName, "version", pkgVersion, "--deferred"];
    await sync("yarn", bumpArgs);

    const versionApplyArgs = ["version", "apply", "--all"];
    await sync("yarn", versionApplyArgs);
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    if (pkgName === "@vc-shell/create-vc-app") await updateBoilerplatePkgVersions();

    const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
    await sync("npx", changelogArgs, { cwd: workspaceName ? `${workspaceName}` : "." });
  },
});
