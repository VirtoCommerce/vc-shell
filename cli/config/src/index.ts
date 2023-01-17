import merge from "./merge";
import applicationConfiguration from "./templates/vite.application.appconfig";
import libraryConfiguration from "./templates/vite.library.appconfig";
import fs from "fs";
import { UserConfigExport } from "vite";

const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const name = JSON.parse(packageJson.toString()).name;
const version = JSON.parse(packageJson.toString()).version;

export function getLibraryConfiguration(options: UserConfigExport = {}, libraryName: string): UserConfigExport {
  console.log(`Building library ${name} v.${version} ...`);
  return getConfiguration(libraryConfiguration, options, libraryName);
}

export function getApplicationConfiguration(options: UserConfigExport = {}): UserConfigExport {
  console.log(`Building application ${name} v.${version} ...`);
  return getConfiguration(applicationConfiguration, options);
}

function getConfiguration(
  configuration: UserConfigExport,
  options: UserConfigExport = {},
  name?: string
): UserConfigExport {
  return merge(
    configuration,
    name ? { build: { lib: { name } } } : {},
    options
  );
}
