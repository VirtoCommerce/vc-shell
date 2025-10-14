import { release } from "@vc-shell/release-config";
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
  ],
  toTag: (version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    // Lerna handles version bumping automatically
    // This function is kept for backward compatibility
  },
  generateChangelog: async (pkgName, pkgVersion, workspaceName) => {
    // Called for side effects (updateBoilerplatePkgVersions)
    if (pkgName === "@vc-shell/create-vc-app" || pkgName === "") {
      await updateBoilerplatePkgVersions();
    }
    // Lerna generates changelogs automatically
  },
});
