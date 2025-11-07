import { isValidName } from "./utils.js";
import type { CLIArgs } from "./types.js";

export function validateBasePath(basePath: string): boolean {
  return basePath.startsWith("/") && basePath.endsWith("/");
}

export function validateArgs(args: CLIArgs): string[] {
  const errors: string[] = [];

  if (args["package-name"] && !isValidName(args["package-name"])) {
    errors.push(`Invalid package name: ${args["package-name"]}`);
  }

  if (args["base-path"] && !validateBasePath(args["base-path"])) {
    errors.push(`Invalid base path: ${args["base-path"]}. Must start and end with "/"`);
  }

  return errors;
}

