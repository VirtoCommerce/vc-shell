import chalk from "chalk";
import { runCLI } from "./cli/run.js";
import { CLIError, UserCancelledError, ValidationError } from "./cli/errors.js";

async function main(): Promise<void> {
  try {
    await runCLI(process.argv.slice(2));
  } catch (error: any) {
    handleError(error);
  }
}

function handleError(error: unknown): void {
  if (error instanceof UserCancelledError) {
    console.log(chalk.yellow("\n⚠️  Operation cancelled by user\n"));
    process.exit(0);
  }

  if (error instanceof ValidationError) {
    if (error.issues?.length) {
      console.error(chalk.red("\n❌ Validation errors:\n"));
      for (const issue of error.issues) {
        console.error(chalk.red(`   • ${issue}`));
      }
      console.log(chalk.gray(`\n   Run ${chalk.cyan("create-vc-app --help")} for usage information.\n`));
    }

    process.exit(error.exitCode);
  }

  if (error instanceof CLIError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`\n❌ Unexpected error: ${message}`));
  if (error instanceof Error && error.stack) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
}

main();
