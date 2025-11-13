import { generateInitialChangelogs, PackageConfig } from "@vc-shell/release-config";

/**
 * Generates complete CHANGELOG.md files from all commits for each package
 * Used for initial changelog initialization when migrating to the new system
 */

const packages: PackageConfig[] = [
  { name: "framework", path: "framework", displayName: "Framework (@vc-shell/framework)" },
  {
    name: "cli/api-client",
    path: "cli/api-client",
    displayName: "API Client Generator (@vc-shell/api-client-generator)",
  },
  { name: "cli/create-vc-app", path: "cli/create-vc-app", displayName: "Create VC App (@vc-shell/create-vc-app)" },
  {
    name: "configs/release-config",
    path: "configs/release-config",
    displayName: "Release Config (@vc-shell/release-config)",
  },
  { name: "configs/vite-config", path: "configs/vite-config", displayName: "Vite Config (@vc-shell/vite-config)" },
  { name: "configs/ts-config", path: "configs/ts-config", displayName: "TypeScript Config (@vc-shell/ts-config)" },
];

generateInitialChangelogs({
  packages,
  rootDir: process.cwd(),
  generateRoot: true,
  includeRootHeader: true,
}).catch((error: unknown) => {
  console.error("\n❌ Error generating changelogs:", error);
  process.exit(1);
});
