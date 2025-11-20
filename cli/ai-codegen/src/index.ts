#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { mcpServerCommand } from "./commands/mcp";
import { mcpInitCommand } from "./commands/mcp-init";

const program = new Command();

program
  .name("vcgen")
  .description("MCP server for AI-powered VC Shell code generation")
  .version("0.7.6");

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

program.parse();

