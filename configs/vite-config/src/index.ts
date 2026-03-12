import applicationConfiguration from "@vite-config/templates/vite.application.appconfig";
import libraryConfiguration from "@vite-config/templates/vite.library.appconfig";
import * as fs from "node:fs";
import { mergeConfig, UserConfig, AliasOptions } from "vite";
import { cwd } from "node:process";
import modulesLibraryConfiguration from "@vite-config/templates/vite.modules-library.appconfig";
import type { ModulesLibraryOptions } from "@vite-config/templates/vite.modules-library.appconfig";

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
  const merged = mergeConfig(configuration, options);

  const baseAlias = configuration.resolve?.alias;
  const optionAlias = options.resolve?.alias;

  if (!baseAlias && !optionAlias) {
    return merged;
  }

  if (!merged.resolve) {
    merged.resolve = {};
  }

  merged.resolve.alias = mergeAliases(baseAlias, optionAlias);
  return merged;
}

function mergeAliases(baseAlias?: AliasOptions, optionAlias?: AliasOptions): AliasOptions | undefined {
  if (!baseAlias) return optionAlias;
  if (!optionAlias) return baseAlias;

  const isBaseArray = Array.isArray(baseAlias);
  const isOptionArray = Array.isArray(optionAlias);

  if (!isBaseArray && !isOptionArray) {
    return { ...baseAlias, ...optionAlias };
  }

  return [...toAliasArray(baseAlias), ...toAliasArray(optionAlias)];
}

function toAliasArray(alias: AliasOptions) {
  if (Array.isArray(alias)) {
    return alias;
  }

  return Object.entries(alias).map(([find, replacement]) => ({ find, replacement }));
}

function getModulesLibraryConfiguration(options: ModulesLibraryOptions = {}) {
  console.log(`Building modules library ${name} v.${version} ...`);
  const baseConfig = modulesLibraryConfiguration(options);
  return mergeConfig(baseConfig, options as UserConfig);
}

export type { ModulesLibraryOptions } from "@vite-config/templates/vite.modules-library.appconfig";

export { getLibraryConfiguration, getApplicationConfiguration, getModulesLibraryConfiguration };
