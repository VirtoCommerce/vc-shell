import applicationConfiguration from "./templates/vite.application.appconfig";
import libraryConfiguration from "./templates/vite.library.appconfig";
import fs from "fs";
import { mergeConfig, UserConfig, UserConfigExport } from "vite";

const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const name = JSON.parse(packageJson.toString()).name;
const version = JSON.parse(packageJson.toString()).version;

export function getLibraryConfiguration(options: UserConfig = {}) {
  console.log(`Building library ${name} v.${version} ...`);
  return getConfiguration(libraryConfiguration, options);
}

export function getApplicationConfiguration(options: UserConfig = {}) {
  console.log(`Building application ${name} v.${version} ...`);
  return getConfiguration(applicationConfiguration, options);
}

function getConfiguration(configuration: UserConfig = {}, options: UserConfig) {
  return mergeConfig(configuration, options);
}
