import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import prompts from "prompts";
import { execa } from "execa";
import ora from "ora";
import { getPackageManager, getInstallCommand, getDevFlag } from "../utils/get-package-manager.js";

export interface McpInitOptions {
  client?: "cursor" | "vscode" | "claude" | "codex";
  cwd: string;
}

const MCP_CONFIGS = {
  cursor: {
    file: ".cursor/mcp.json",
    content: {
      mcpServers: {
        vcshell: {
          command: "npx",
          args: ["@vc-shell/ai-codegen@latest", "mcp"],
        },
      },
    },
  },
  vscode: {
    file: ".vscode/mcp.json",
    content: {
      servers: {
        vcshell: {
          command: "npx",
          args: ["@vc-shell/ai-codegen@latest", "mcp"],
        },
      },
    },
  },
  claude: {
    file: ".mcp.json",
    content: {
      mcpServers: {
        vcshell: {
          command: "npx",
          args: ["@vc-shell/ai-codegen@latest", "mcp"],
        },
      },
    },
  },
  codex: {
    file: "~/.codex/config.toml",
    content: `[mcp_servers.vcshell]
command = "npx"
args = ["@vc-shell/ai-codegen@latest", "mcp"]`,
  },
};

export async function mcpInitCommand(options: McpInitOptions): Promise<void> {
  let { client, cwd } = options;

  // Interactive client selection if not provided
  if (!client) {
    const response = await prompts({
      type: "select",
      name: "client",
      message: "Which MCP client are you using?",
      choices: [
        { title: "Cursor", value: "cursor" },
        { title: "Claude Code", value: "claude" },
        { title: "VS Code", value: "vscode" },
        { title: "Codex", value: "codex" },
      ],
    });

    if (!response.client) {
      console.log(chalk.red("\n❌ Cancelled"));
      return;
    }

    client = response.client;
  }

  console.log(chalk.cyan(`\n🔧 Setting up VC-Shell MCP for ${client}...\n`));

  // Check if package.json exists (to determine if we should install dependencies)
  const packageJsonPath = path.join(cwd, "package.json");
  const hasPackageJson = fs.existsSync(packageJsonPath);

  // Install dependencies if in a project
  if (hasPackageJson) {
    try {
      const packageManager = await getPackageManager(cwd);
      const installCmd = getInstallCommand(packageManager);
      const devFlag = getDevFlag(packageManager);

      console.log(chalk.gray(`Detected package manager: ${packageManager}`));

      const installResponse = await prompts({
        type: "confirm",
        name: "install",
        message: `Install @vc-shell/ai-codegen as a dev dependency?`,
        initial: true,
      });

      if (installResponse.install) {
        const spinner = ora("Installing dependencies...").start();

        try {
          await execa(packageManager, [installCmd, "@vc-shell/ai-codegen@latest", devFlag], {
            cwd,
          });
          spinner.succeed("Dependencies installed");
        } catch (error) {
          spinner.fail("Failed to install dependencies");
          console.log(chalk.yellow("\nYou can install manually:"));
          console.log(
            chalk.gray(`  ${packageManager} ${installCmd} @vc-shell/ai-codegen@latest ${devFlag}`)
          );
        }
      }
    } catch (error) {
      console.log(chalk.yellow("⚠️  Could not detect package manager"));
    }
  }

  const config = MCP_CONFIGS[client];

  // Handle Codex (TOML format, global config)
  if (client === "codex") {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const codexConfigPath = path.join(homeDir, ".codex", "config.toml");

    console.log(chalk.yellow("\n⚠️  Codex configuration needs manual setup:"));
    console.log(chalk.white("\n1. Open (or create) ~/.codex/config.toml"));
    console.log(chalk.white("2. Add the following lines:\n"));
    console.log(chalk.gray(config.content));
    console.log(chalk.white("\n3. Restart Codex\n"));

    if (hasPackageJson) {
      console.log(
        chalk.cyan("📦 Package installed. Codex will use it when the MCP server is configured.")
      );
    }

    return;
  }

  // Handle other clients (JSON config, project-local)
  const configPath = path.join(cwd, config.file);
  const configDir = path.dirname(configPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log(chalk.green(`✓ Created ${path.basename(configDir)}/ directory`));
  }

  // Check if file exists
  let existingConfig: any = {};
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      console.log(chalk.yellow(`⚠️  Found existing ${config.file}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error reading ${config.file}: ${error}`));
      return;
    }
  }

  // Merge configurations (VS Code uses 'servers', others use 'mcpServers')
  const serverKey = client === "vscode" ? "servers" : "mcpServers";
  const newConfig = {
    ...existingConfig,
    [serverKey]: {
      ...(existingConfig[serverKey] || {}),
      vcshell: (config.content as any)[serverKey].vcshell,
    },
  };

  // Write configuration
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf-8");
    console.log(chalk.green(`✓ Updated ${config.file}`));
  } catch (error) {
    console.log(chalk.red(`❌ Error writing ${config.file}: ${error}`));
    return;
  }

  // Print next steps
  console.log(chalk.cyan("\n📝 Next Steps:\n"));

  switch (client) {
    case "cursor":
      console.log(chalk.white("1. Restart Cursor (Command/Ctrl + Q)"));
      console.log(chalk.white("2. Go to Settings → Features → MCP"));
      console.log(chalk.white("3. Enable the 'vcshell' server"));
      console.log(chalk.white("4. Look for a green dot next to vcshell\n"));
      break;

    case "vscode":
      console.log(chalk.white("1. Open .vscode/mcp.json in VS Code"));
      console.log(chalk.white("2. Click 'Start' next to the vcshell server"));
      console.log(chalk.white("3. Wait for connection confirmation\n"));
      break;

    case "claude":
      console.log(chalk.white("1. Restart Claude Code"));
      console.log(chalk.white("2. Run /mcp command"));
      console.log(chalk.white("3. Verify 'vcshell' shows 'Connected'\n"));
      break;
  }

  console.log(chalk.cyan("🚀 Try these prompts:\n"));
  console.log(chalk.gray("  • Create a new VC-Shell app called my-vendor-portal"));
  console.log(chalk.gray("  • Show me all available VC-Shell components"));
  console.log(chalk.gray("  • Search for table components"));
  console.log(chalk.gray("  • Create vendor management with list and details\n"));

  console.log(chalk.green("✨ Setup complete!\n"));
}
