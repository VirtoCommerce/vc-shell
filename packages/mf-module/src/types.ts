import type { UserConfig } from "vite";

/**
 * Compatibility options for dynamic modules.
 * Metadata only — not used during build. The platform validates module
 * dependencies at install time via the .NET dependency graph.
 */
export interface CompatibilityOptions {
  /**
   * Compatible framework version range
   * @example "^1.1.0"
   */
  framework: string;

  /**
   * Compatible modules version ranges
   * @example { "@vc-shell/module-catalog": "^1.0.0" }
   */
  modules?: Record<string, string>;
}

/**
 * Dynamic module configuration options (Module Federation)
 */
export interface DynamicModuleOptions extends UserConfig {
  /**
   * The platform app identifier (e.g. `"vendor-portal"`). When set, build
   * output goes to `<moduleRoot>/plugins/<appId>/` AND the platform serves
   * the remote entry via `GET /api/apps/<appId>/manifest`.
   *
   * Omit for legacy build (outDir defaults to "dist/mf").
   */
  appId?: string;

  /**
   * Absolute path to the .NET module root (the folder containing
   * module.manifest). Used with `appId` to compute the final outDir.
   * Defaults to `process.cwd()` — correct when vite.config.ts sits
   * directly at the .NET module root.
   *
   * For multi-plugin .NET modules where vite.config.ts is in a subfolder:
   * ```ts
   * import { fileURLToPath } from "node:url";
   * import path from "node:path";
   * const __dirname = path.dirname(fileURLToPath(import.meta.url));
   * moduleRoot: path.resolve(__dirname, "..");
   * ```
   */
  moduleRoot?: string;

  /**
   * Module Federation `name` for this remote. Must equal `remote.name`
   * returned by the platform manifest for this plugin — by default the
   * .NET module id (e.g. "VirtoCommerce.MarketplaceReview"). Defaults
   * to `pkg.name` (the npm package name) when omitted.
   */
  remoteName?: string;

  /**
   * Entry point for the module
   * @default "./src/modules/index.ts"
   */
  entry?: string;

  /**
   * Custom MF exposes map. Overrides default `{ "./Module": entry }`
   * (matches the platform's `PluginRemote.exposed` default).
   */
  exposes?: Record<string, string>;

  /**
   * @deprecated metadata only — platform ignores this field; rely on
   * `<dependency>` declarations in module.manifest instead.
   */
  compatibility?: CompatibilityOptions;
}
