import path from "node:path";
import fs from "node:fs/promises";
import { globby } from "globby";
import chalk from "chalk";
import { FRAMEWORK_DIR, STORYBOOK_URL } from "../config.js";
import { fetchStorybookIds } from "../storybook/index-fetcher.js";
import { runLint } from "../lint/runner.js";

export async function runLintCommand(): Promise<{ exitCode: number }> {
  const sources = await globby(["**/*.docs.md"], { cwd: FRAMEWORK_DIR, absolute: true });
  const files = await Promise.all(
    sources.map(async (abs) => ({
      absPath: abs,
      relPath: path.relative(FRAMEWORK_DIR, abs),
      raw: await fs.readFile(abs, "utf8"),
    })),
  );

  let knownStoryIds = new Set<string>();
  try {
    knownStoryIds = await fetchStorybookIds(STORYBOOK_URL);
  } catch (err) {
    console.warn(
      chalk.yellow(`warning: could not fetch Storybook index (${(err as Error).message}); skipping story-id checks`),
    );
  }

  const result = await runLint({ sources: files, knownStoryIds });

  for (const w of result.warnings) {
    console.log(chalk.yellow(`warn  ${w.rule}  ${w.file}: ${w.message}`));
  }
  for (const e of result.errors) {
    console.log(chalk.red(`error ${e.rule}  ${e.file}: ${e.message}`));
  }
  console.log(chalk.bold(`\n${result.errors.length} errors, ${result.warnings.length} warnings`));

  return { exitCode: result.errors.length > 0 ? 1 : 0 };
}
