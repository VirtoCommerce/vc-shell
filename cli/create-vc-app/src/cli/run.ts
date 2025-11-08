import chalk from "chalk";
import path from "node:path";
import { cwd as processCwd } from "node:process";
import { parseArgs } from "./argv.js";
import { validateArgs } from "./validation.js";
import { showHelp, showVersion } from "./help.js";
import { checkNodeVersion } from "./runtime.js";
import { createApplication } from "../workflows/create-app.js";
import { generateBlade } from "../commands/generate-blade.js";
import type { CLIArgs } from "./types.js";
import { CLIError, UserCancelledError, ValidationError } from "./errors.js";
import mainPkg from "../../package.json" assert { type: "json" };

export async function runCLI(rawArgv: string[]): Promise<number> {
  const args = parseArgs(rawArgv);

  if (args.help) {
    showHelp();
    return 0;
  }

  if (args.version) {
    showVersion();
    return 0;
  }

  ensureNodeCompatibility();

  const command = args._[0];

  if (command === "blade" || command === "generate") {
    await runBladeGenerator(args);
    return 0;
  }

  const validationIssues = validateArgs(args);
  if (validationIssues.length > 0) {
    throw new ValidationError(validationIssues);
  }

  printHeader();
  await runCreateAppWorkflow(args);
  return 0;
}

function ensureNodeCompatibility(): void {
  const result = checkNodeVersion();

  if (!result.compatible) {
    throw new CLIError(
      [
        chalk.red(`❌ Node.js ${result.minVersion} or higher is required.`),
        chalk.red(`   Current version: ${result.currentVersion}`),
        chalk.yellow(`\n   Please upgrade Node.js to continue.`),
      ].join("\n"),
    );
  }
}

async function runBladeGenerator(args: CLIArgs): Promise<void> {
  const [, bladeName] = args._;
  await generateBlade({
    name: bladeName || args.name,
    type: args.type,
    module: args.module,
    composable: args.composable,
    locales: args.locales,
    widget: args.widget,
    isWorkspace: args["is-workspace"],
    path: args.path,
    formFields: args["form-fields"],
    skipFormEditor: args["skip-form-editor"],
    widgetModule: args["widget-module"],
    widgetBlade: args["widget-blade"],
    widgetName: args["widget-name"],
    widgetEntity: args["widget-entity"],
    widgetIcon: args["widget-icon"],
  });
}

async function runCreateAppWorkflow(args: CLIArgs): Promise<void> {
  try {
    const result = await createApplication({ args, cwd: processCwd() });
    printCreateSummary(result.root, result.config.packageName, result.config.basePath, result.filesCreated);
    printNextSteps(result.root);
  } catch (error: any) {
    if (error instanceof UserCancelledError) {
      console.log(chalk.yellow("\n⚠️  Operation cancelled by user"));
      console.log(chalk.gray("   No changes were made.\n"));
      return;
    }

    throw error;
  }
}

function printHeader(): void {
  const line = "═".repeat(50);
  console.log(chalk.bold(chalk.green(`\n╔${line}╗`)));
  console.log(chalk.bold(chalk.green(`║  create-vc-app v${mainPkg.version}${" ".repeat(50 - 17 - String(mainPkg.version).length)}║`)));
  console.log(chalk.bold(chalk.green(`╚${line}╝\n`)));
}

function printCreateSummary(root: string, packageName: string, basePath: string, filesCreated: number): void {
  console.log(chalk.green(`\n${"=".repeat(50)}`));
  console.log(chalk.green(chalk.bold("✨ Application created successfully!")));
  console.log(chalk.green(`${"=".repeat(50)}\n`));

  console.log(chalk.cyan("📊 Summary:"));
  console.log(chalk.cyan(`   Location: ${chalk.bold(root)}`));
  console.log(chalk.cyan(`   Package: ${chalk.bold(packageName)}`));
  console.log(chalk.cyan(`   Base path: ${chalk.bold(basePath)}`));
  console.log(chalk.cyan(`   Files created: ${chalk.bold(filesCreated.toString())}`));
}

function printNextSteps(root: string): void {
  console.log(chalk.cyan(`\n🚀 Next steps:\n`));

  const cwd = processCwd();
  if (root !== cwd) {
    const relative = path.relative(cwd, root) || root;
    const displayPath = relative.includes(" ") ? `"${relative}"` : relative;
    console.log(chalk.white(`  1. ${chalk.bold(chalk.cyan(`cd ${displayPath}`))}`));
    console.log(chalk.white(`  2. ${chalk.bold(chalk.cyan("yarn"))}`));
    console.log(chalk.white(`  3. ${chalk.bold(chalk.cyan("yarn serve"))}`));
  } else {
    console.log(chalk.white(`  1. ${chalk.bold(chalk.cyan("yarn"))}`));
    console.log(chalk.white(`  2. ${chalk.bold(chalk.cyan("yarn serve"))}`));
  }

  console.log(chalk.gray(`\n  You can also run:`));
  console.log(chalk.gray(`    yarn build  - Build for production`));
  console.log(chalk.gray(`    yarn lint   - Run linter`));
  console.log(chalk.gray(`    create-vc-app blade  - Generate modules/blades/widgets`));
  console.log();
}
