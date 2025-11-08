import mri from "mri";
import { argv as processArgv } from "node:process";
import type { CLIArgs } from "./types.js";

export function parseArgs(rawArgv: string[] = processArgv.slice(2)): CLIArgs {
  return mri(rawArgv, {
    alias: {
      h: "help",
      v: "version",
    },
    boolean: [
      "help",
      "version",
      "overwrite",
      "composable",
      "locales",
      "widget",
      "is-workspace",
      "skip-form-editor",
      "skip-module-gen",
    ],
    string: [
      "name",
      "app-name",
      "package-name",
      "module-name",
      "base-path",
      "type",
      "module",
      "path",
      "form-fields",
      "widget-module",
      "widget-blade",
      "widget-name",
      "widget-entity",
      "widget-icon",
    ],
  }) as CLIArgs;
}

