import { release } from "@vc-shell/release-config";
import { spawnSync } from "child_process";

release({
  packages: ["framework"],
  toTag: (pkg, version) => `v${version}`,
  bumpVersion: async (pkgName, pkgVersion) => {
    const bumpArgs = ["workspaces", 'foreach', '-v', '--topological', 'version', pkgVersion]
    await spawnSync("yarn", bumpArgs);
  },
  generateChangelog: async (pkgName) => {
    // if (pkgName === 'create-vite') await updateTemplateVersions()

    const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
    //if (pkgName !== 'vite') \
    changelogArgs.push("--lerna-package", pkgName);
    await spawnSync("npx", changelogArgs, { cwd: `${pkgName}` });
  },
});
