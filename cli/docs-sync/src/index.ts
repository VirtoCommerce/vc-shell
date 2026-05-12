#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();
program.name("docs-sync").description("vc-shell → vc-docs sync tool").version("0.1.0");

program
  .command("sync")
  .description("Sync *.docs.md from vc-shell into vc-docs")
  .requiredOption("--target <path>", "path to vc-docs checkout")
  .option("--dry-run", "do not write files; only report what would change")
  .option("--report <path>", "where to write sync-report.md (default: ./sync-report.md)")
  .option("--framework-dir <path>", "override path to vc-shell framework root (for testing)")
  .action(async (opts) => {
    const { runSync } = await import("./commands/sync.js");
    const res = await runSync({
      target: opts.target,
      frameworkDir: opts.frameworkDir,
      dryRun: opts.dryRun,
      reportPath: opts.report,
    });
    process.exit(res.exitCode);
  });

program
  .command("lint")
  .description("Validate *.docs.md against the template")
  .action(async () => {
    const { runLintCommand } = await import("./commands/lint.js");
    const res = await runLintCommand();
    process.exit(res.exitCode);
  });

program
  .command("screenshot")
  .description("Capture a Playwright screenshot using style-guide defaults")
  .option("--url <url>", "direct URL (e.g. dev server)")
  .option("--story <id>", "Storybook story id")
  .option("--selector <css>", "CSS selector to crop to")
  .option("--theme <theme>", "light | dark")
  .option("--viewport <wxh>", "viewport size, e.g. 1280x800")
  .requiredOption("--out <path>", "output file path (.webp)")
  .action(async (opts) => {
    const { runScreenshotCommand } = await import("./commands/screenshot.js");
    const res = await runScreenshotCommand(opts);
    process.exit(res.exitCode);
  });

program.parse();
