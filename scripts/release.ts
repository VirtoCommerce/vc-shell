import { release } from "@vc-shell/release-config";
import { updateBoilerplatePkgVersions, updateAppsDependencies } from "./utils";

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
  customHooks: async (pkgVersion) => {
    // Called for side effects (update boilerplate template and apps)
    await updateBoilerplatePkgVersions();
    await updateAppsDependencies();
  },
});
