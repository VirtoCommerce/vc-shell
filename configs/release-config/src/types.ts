export interface PackageConfig {
  /** Short identifier, e.g. "framework" */
  name: string;
  /** Relative path from repo root, e.g. "framework" */
  path: string;
  /** Human-readable label for changelogs, e.g. "VC-Shell Framework (@vc-shell/framework)" */
  displayName: string;
}

export interface ReleaseConfig {
  packages: PackageConfig[];
  /**
   * Git tag prefix passed to `lerna version --tag-version-prefix`.
   * Use `"v"` (default) for framework, `"vendor-portal-v"` for vendor-portal
   * to avoid tag collisions in multi-repo setups.
   */
  tagVersionPrefix?: string;
  /** Hook executed after version bump (e.g. update boilerplate deps). */
  customHooks?: (version: string) => void | Promise<void>;
  /** Whether to sync root package.json version with packages (default true). */
  updateRootVersion?: boolean;
  /** Whether to version every package on each release (default false). */
  forcePublish?: boolean;
}

export interface ChangelogGeneratorOptions {
  packages: PackageConfig[];
  rootDir?: string;
  generateRoot?: boolean;
  includeRootHeader?: boolean;
}

export interface RootChangelogOptions {
  packages: PackageConfig[];
  rootDir?: string;
  includeRootHeader?: boolean;
}
