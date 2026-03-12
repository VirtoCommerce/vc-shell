import { mergeConfig, type UserConfig } from "vite";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import dynamicModuleConfiguration from "./dynamic-module-config";
import type { DynamicModuleOptions } from "./types";

export type { DynamicModuleOptions, CompatibilityOptions } from "./types";
export { stripExternalStyles } from "./strip-external-styles";

const getPackageJson = () => {
  try {
    const packageJsonPath = join(cwd(), "package.json");
    return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  } catch (error) {
    console.error("Error reading package.json:", error);
    return { name: "unknown-module", version: "0.0.0", dependencies: {} };
  }
};

/**
 * Generate a Vite configuration for a dynamic MF module.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { getDynamicModuleConfiguration } from "@vc-shell/mf-module";
 *
 * export default getDynamicModuleConfiguration({
 *   compatibility: { framework: "^2.0.0" },
 * });
 * ```
 */
export function getDynamicModuleConfiguration(options: DynamicModuleOptions): UserConfig {
  const pkg = getPackageJson();
  console.log(`Building dynamic module: ${pkg.name}@${pkg.version}`);

  const baseConfig = dynamicModuleConfiguration(pkg, options);
  return mergeConfig(baseConfig, options);
}
