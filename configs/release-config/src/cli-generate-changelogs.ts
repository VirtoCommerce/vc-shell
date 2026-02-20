#!/usr/bin/env node
import { generateInitialChangelogs, PackageConfig } from "@release-config/generate-changelogs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";

/**
 * CLI for generating initial changelogs
 * Usage: vc-generate-changelogs [config-file]
 *
 * Config file should export an object with:
 * {
 *   packages: Array<{ name: string, path: string, displayName: string }>,
 *   rootDir?: string,
 *   generateRoot?: boolean,
 *   includeRootHeader?: boolean
 * }
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${chalk.cyan("vc-generate-changelogs")} - Generate CHANGELOG.md files from git history

${chalk.bold("USAGE:")}
  vc-generate-changelogs [config-file]

${chalk.bold("ARGUMENTS:")}
  config-file    Path to configuration file (default: changelog-config.js)

${chalk.bold("CONFIG FILE FORMAT:")}
  The config file should export an object with the following structure:

  export default {
    packages: [
      {
        name: "framework",
        path: "framework",
        displayName: "Framework (@vc-shell/framework)"
      },
      // ... more packages
    ],
    rootDir: process.cwd(),           // Optional: root directory
    generateRoot: true,                // Optional: generate root changelog
    includeRootHeader: true            // Optional: include header in root changelog
  };

${chalk.bold("EXAMPLE:")}
  vc-generate-changelogs changelog-config.js
    `);
    process.exit(0);
  }

  const configPath = args[0] || "changelog-config.js";
  const resolvedPath = resolve(process.cwd(), configPath);

  try {
    console.log(chalk.blue(`📖 Loading config from ${resolvedPath}...`));

    // Dynamic import for ESM support
    const config = await import(resolvedPath);
    const options = config.default || config;

    if (!options.packages || !Array.isArray(options.packages)) {
      console.error(chalk.red("\n❌ Error: Config must export an object with 'packages' array"));
      console.error(chalk.yellow("\nExpected format:"));
      console.error(chalk.gray("  export default { packages: [...] }"));
      process.exit(1);
    }

    // Validate package configs
    for (const pkg of options.packages) {
      if (!pkg.name || !pkg.path || !pkg.displayName) {
        console.error(chalk.red(`\n❌ Error: Invalid package config: ${JSON.stringify(pkg)}`));
        console.error(chalk.yellow("\nEach package must have: name, path, displayName"));
        process.exit(1);
      }
    }

    await generateInitialChangelogs(options);
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND" ||
      (error as NodeJS.ErrnoException).code === "ERR_MODULE_NOT_FOUND"
    ) {
      console.error(chalk.red(`\n❌ Error: Config file not found: ${resolvedPath}`));
      console.error(chalk.yellow("\nCreate a config file or specify a different path."));
      console.error(chalk.gray("\nRun 'vc-generate-changelogs --help' for more information."));
    } else {
      console.error(chalk.red("\n❌ Error generating changelogs:"), error);
    }
    process.exit(1);
  }
}

main();
