export interface ReleasePackageConfig {
  path: string;
  packageName: string;
  displayName: string;
}

// ⚠️ Adding a package here is NOT enough to publish it. Publishing uses npm
// Trusted Publishing (OIDC), so each package must also be registered as a
// trusted publisher on npmjs.com (Settings → Trusted Publisher → GitHub
// Actions) with workflow filename `publish.yml`. A package that is listed here
// but not registered will fail its first publish with a silent 404. See
// .github/workflows/README.md → "Trusted Publishing".

export const releasePackages: ReleasePackageConfig[] = [
  {
    path: "framework",
    packageName: "@vc-shell/framework",
    displayName: "VC-Shell Framework (@vc-shell/framework)",
  },
  {
    path: "cli/api-client",
    packageName: "@vc-shell/api-client-generator",
    displayName: "API Client Generator (@vc-shell/api-client-generator)",
  },
  {
    path: "cli/create-vc-app",
    packageName: "@vc-shell/create-vc-app",
    displayName: "Create VC App (@vc-shell/create-vc-app)",
  },
  {
    path: "cli/migrate",
    packageName: "@vc-shell/migrate",
    displayName: "VC Shell Migrate (@vc-shell/migrate)",
  },
  {
    path: "configs/vite-config",
    packageName: "@vc-shell/config-generator",
    displayName: "Vite Config (@vc-shell/config-generator)",
  },
  {
    path: "configs/ts-config",
    packageName: "@vc-shell/ts-config",
    displayName: "TypeScript Config (@vc-shell/ts-config)",
  },
  {
    path: "packages/mf-config",
    packageName: "@vc-shell/mf-config",
    displayName: "MF Config (@vc-shell/mf-config)",
  },
  {
    path: "packages/mf-host",
    packageName: "@vc-shell/mf-host",
    displayName: "MF Host (@vc-shell/mf-host)",
  },
  {
    path: "packages/mf-module",
    packageName: "@vc-shell/mf-module",
    displayName: "MF Module (@vc-shell/mf-module)",
  },
  {
    path: "cli/vc-app-skill",
    packageName: "@vc-shell/vc-app-skill",
    displayName: "VC App Skill (@vc-shell/vc-app-skill)",
  },
];
