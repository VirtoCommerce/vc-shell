export interface ReleasePackageConfig {
  path: string;
  packageName: string;
  displayName: string;
}

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
    path: "configs/vite-config",
    packageName: "@vc-shell/config-generator",
    displayName: "Vite Config (@vc-shell/config-generator)",
  },
  {
    path: "configs/ts-config",
    packageName: "@vc-shell/ts-config",
    displayName: "TypeScript Config (@vc-shell/ts-config)",
  },
];
