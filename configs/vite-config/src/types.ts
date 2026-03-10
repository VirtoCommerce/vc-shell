import { UserConfig } from "vite";

/**
 * Compatibility options for dynamic modules
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
   * Entry point for the module
   * @default "./src/modules/index.ts"
   */
  entry?: string;

  /**
   * Custom MF exposes map. Overrides default `{ "./module": entry }`.
   */
  exposes?: Record<string, string>;

  /**
   * Compatibility constraints (metadata only — not used during build).
   * Used by the runtime registry API for version filtering.
   */
  compatibility?: CompatibilityOptions;
}
