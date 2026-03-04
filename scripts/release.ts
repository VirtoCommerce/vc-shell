import { release } from "@vc-shell/release-config";
import type { PackageConfig } from "@vc-shell/release-config";
import { updateBoilerplatePkgVersions, updateAppsDependencies } from "./utils";

const packages: PackageConfig[] = [
  { name: "framework", path: "framework", displayName: "VC-Shell Framework (@vc-shell/framework)" },
  { name: "cli/api-client", path: "cli/api-client", displayName: "API Client Generator (@vc-shell/api-client-generator)" },
  { name: "cli/create-vc-app", path: "cli/create-vc-app", displayName: "Create VC App (@vc-shell/create-vc-app)" },
  { name: "configs/release-config", path: "configs/release-config", displayName: "Release Config (@vc-shell/release-config)" },
  { name: "configs/vite-config", path: "configs/vite-config", displayName: "Vite Config (@vc-shell/config-generator)" },
  { name: "configs/ts-config", path: "configs/ts-config", displayName: "TypeScript Config (@vc-shell/ts-config)" },
];

release({
  packages,
  tagVersionPrefix: "v",
  // Keep all published packages on the same version for each release.
  forcePublish: true,
  customHooks: async () => {
    await updateBoilerplatePkgVersions();
    await updateAppsDependencies();
  },
});
