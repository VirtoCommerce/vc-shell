import applicationConfiguration from "./templates/vite.application.appconfig";
import libraryConfiguration from "./templates/vite.library.appconfig";
import * as fs from "node:fs";
import { mergeConfig, UserConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { cwd } from "node:process";
import dynamicModuleConfiguration from "./templates/vite.dynamic-module.appconfig";
import { DynamicModuleOptions } from "./types";

const packageJson = fs.readFileSync(cwd() + "/package.json");
const name = JSON.parse(packageJson.toString()).name;
const version = JSON.parse(packageJson.toString()).version;

function getLibraryConfiguration(options: UserConfig = {}) {
  console.log(`Building library ${name} v.${version} ...`);
  return getConfiguration(libraryConfiguration, options);
}

function getApplicationConfiguration(options: UserConfig = {}) {
  console.log(`Building application ${name} v.${version} ...`);
  return getConfiguration(applicationConfiguration, options);
}

function getConfiguration(configuration: UserConfig = {}, options: UserConfig) {
  return mergeConfig(configuration, options);
}

// Get package.json from current working directory
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
 * Generate a Vite configuration for a dynamic module
 *
 * @param options - Custom configuration options
 * @returns Vite configuration
 *
 * @example
 * ```js
 * // vite.config.js
 * import { getDynamicModuleConfiguration } from '@vc-shell/dynamic-modules-config';
 *
 * export default getDynamicModuleConfiguration({
 *   // Custom configuration options
 *   compatibility: {
 *     framework: '^1.1.0',
 *     apps: {
 *       'vendor-portal-new': '^2.0.0'
 *     }
 *   }
 * });
 * ```
 */
function getDynamicModuleConfiguration(options: DynamicModuleOptions) {
  console.log(`Building dynamic module with options:`, options);
  const pkg = getPackageJson();
  const name = pkg.name;
  const version = pkg.version;
  console.log(`Module: ${name}@${version}`);

  const baseConfig = dynamicModuleConfiguration(pkg, options);
  return mergeConfig(baseConfig, options);
}

export type { DynamicModuleOptions, CompatibilityOptions } from "./types";

export { getLibraryConfiguration, getApplicationConfiguration, getDynamicModuleConfiguration };
