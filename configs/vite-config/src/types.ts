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

  /**
   * Compatible applications version ranges
   * @example { "vendor-portal-new": "^2.0.0" }
   */
  apps: Record<string, string>;
}

/**
 * Dynamic module configuration options
 */
export interface DynamicModuleOptions extends UserConfig {
  /**
   * Entry point for the module
   * @default "./index.ts"
   */
  entry?: string;

  /**
   * Output directory for the module
   * @default "dist/packages/modules"
   */
  outDir?: string;

  /**
   * Module name for UMD build
   * @default Derived from package name
   */
  moduleName?: string;

  /**
   * Compatibility constraints for the module
   * @required Both framework and apps fields are required
   */
  compatibility: CompatibilityOptions;

  /**
   * Additional external dependencies
   * @default []
   */
  externals?: string[];
}
