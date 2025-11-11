#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { planCommand } from "./commands/plan.js";
import { generateCommand } from "./commands/generate.js";
import { validateCommand } from "./commands/validate.js";
import { mcpServerCommand } from "./commands/mcp.js";
import { mcpInitCommand } from "./commands/mcp-init.js";
import { viewCommand } from "./commands/view.js";
import { searchCommand } from "./commands/search.js";

const program = new Command();

program
  .name("vcgen")
  .description("AI-powered code generation for VC Shell applications")
  .version("0.1.0");

program
  .command("plan")
  .description("Generate UI-Plan JSON from natural language prompt")
  .option("--from-prompt <text>", "Natural language prompt describing the UI")
  .option("--output <path>", "Output path for UI-Plan JSON", "./__ai/ui-plan.json")
  .action(async (options) => {
    try {
      await planCommand(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("generate")
  .description("Generate code from UI-Plan JSON")
  .requiredOption("--plan <path>", "Path to UI-Plan JSON file")
  .option("--dry-run", "Show diff without writing files")
  .option("--fix", "Run ESLint/Prettier after generation")
  .option("--story", "Generate Storybook stories")
  .option("--test", "Generate unit/e2e tests")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      await generateCommand(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate UI-Plan JSON without generating code")
  .requiredOption("--plan <path>", "Path to UI-Plan JSON file")
  .action(async (options) => {
    try {
      await validateCommand(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("mcp")
  .description("Run as MCP server for Cursor/Claude AI integration")
  .action(async () => {
    try {
      await mcpServerCommand();
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("init-mcp")
  .description("Initialize MCP configuration for your IDE")
  .option("--client <name>", "IDE client: cursor, vscode, claude, codex", "cursor")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (options) => {
    try {
      const validClients = ["cursor", "vscode", "claude", "codex"];
      if (!validClients.includes(options.client)) {
        console.error(
          chalk.red(`Error: Invalid client '${options.client}'. Valid options: ${validClients.join(", ")}`)
        );
        process.exit(1);
      }
      await mcpInitCommand({
        client: options.client as "cursor" | "vscode" | "claude" | "codex",
        cwd: options.cwd,
      });
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("view")
  .description("View detailed information about components")
  .argument("<components...>", "Component names to view")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (components, options) => {
    try {
      await viewCommand({
        components,
        cwd: options.cwd,
      });
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("search")
  .description("Search for components with fuzzy matching")
  .argument("[query]", "Search query (optional, shows all if omitted)")
  .option("--category <category>", "Filter by category")
  .option("--limit <number>", "Maximum number of results", "20")
  .option("--offset <number>", "Number of results to skip", "0")
  .option("--cwd <path>", "Working directory", process.cwd())
  .action(async (query, options) => {
    try {
      await searchCommand({
        query,
        category: options.category,
        limit: parseInt(options.limit, 10),
        offset: parseInt(options.offset, 10),
        cwd: options.cwd,
      });
    } catch (error) {
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();

