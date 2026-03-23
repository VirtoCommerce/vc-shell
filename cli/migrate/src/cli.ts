#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { resolve } from "node:path";
import { run } from "./runner.js";

const program = new Command();

program
  .name("vc-shell-migrate")
  .description(
    "Migrate your code to the latest @vc-shell/framework version",
  )
  .version("1.0.0")
  .option("--to <version>", "Target framework version (default: latest)")
  .option("--transform <name>", "Run only a specific transform")
  .option("--dry-run", "Preview changes without writing files", false)
  .option("--list", "List available transforms", false)
  .option("--cwd <path>", "Working directory", ".")
  .option(
    "--update-deps",
    "Also update dependency versions in package.json",
    false,
  )
  .option(
    "--exclude <patterns...>",
    "Additional exclude patterns for files/directories",
    [],
  )
  .action(async (options) => {
    const cwd = resolve(options.cwd);

    // Pre-flight: dirty working tree check
    if (!options.dryRun && !options.list) {
      try {
        const { execFileSync } = await import("node:child_process");
        const status = execFileSync("git", ["status", "--porcelain"], {
          cwd,
          encoding: "utf-8",
        });
        if (status.trim().length > 0) {
          console.log(
            chalk.yellow(
              "Warning: You have uncommitted changes. " +
                "We recommend committing or stashing before running migrations.",
            ),
          );
        }
      } catch {
        // Not a git repo or git not available — skip check
      }
    }

    await run({
      cwd,
      to: options.to,
      transform: options.transform,
      dryRun: options.dryRun,
      list: options.list,
      updateDeps: options.updateDeps,
      exclude: options.exclude ?? [],
    });
  });

program.parse();
