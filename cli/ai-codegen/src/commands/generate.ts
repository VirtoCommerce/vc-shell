import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { getValidator, type UIPlan } from "../core/validator.js";
import { CodeGenerator } from "../core/code-generator.js";

const execAsync = promisify(exec);

export interface GenerateOptions {
  plan: string;
  dryRun?: boolean;
  fix?: boolean;
  story?: boolean;
  test?: boolean;
  cwd?: string;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const {
    plan: planPath,
    dryRun = false,
    fix = false,
    story = false,
    test = false,
    cwd = process.cwd(),
  } = options;

  console.log(chalk.cyan("\n🚀 Generating code from UI-Plan...\n"));

  if (dryRun) {
    console.log(chalk.yellow("🔍 Dry run mode - no files will be written\n"));
  }

  // Check if file exists
  if (!fs.existsSync(planPath)) {
    throw new Error(`UI-Plan file not found: ${planPath}`);
  }

  // Read and parse plan
  let plan: UIPlan;
  try {
    const content = fs.readFileSync(planPath, "utf-8");
    plan = JSON.parse(content) as UIPlan;
  } catch (error) {
    throw new Error(
      `Failed to parse UI-Plan JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate plan
  const validator = getValidator();
  const result = validator.validateUIPlan(plan);

  if (!result.valid) {
    console.log(chalk.red("❌ UI-Plan validation failed:\n"));
    for (const error of result.errors.filter((e) => e.severity === "error")) {
      console.log(chalk.red(`  ${error.path}: ${error.message}`));
    }
    console.log();
    throw new Error("UI-Plan is invalid");
  }

  // Generate code
  const generator = new CodeGenerator();

  try {
    await generator.generate({
      plan,
      cwd,
      dryRun,
      generateStories: story,
      generateTests: test,
      verbose: true,
    });
  } catch (error) {
    console.error(chalk.red("\n❌ Code generation failed:"));
    throw error;
  }

  if (dryRun) {
    console.log(chalk.yellow("\n🔍 Dry run completed - no files were written"));
    return;
  }

  // Run linter/formatter if requested
  if (fix) {
    console.log(chalk.cyan("\n✨ Running ESLint and Prettier...\n"));

    const modulePath = path.join(cwd, "src", "modules", plan.module);

    try {
      // Try to run ESLint
      try {
        await execAsync(`npx eslint "${modulePath}/**/*.{ts,vue}" --fix`, { cwd });
        console.log(chalk.green("✓ ESLint completed"));
      } catch (error) {
        console.log(chalk.yellow("⚠️  ESLint not available or failed"));
      }

      // Try to run Prettier
      try {
        await execAsync(`npx prettier --write "${modulePath}/**/*.{ts,vue,json}"`, { cwd });
        console.log(chalk.green("✓ Prettier completed"));
      } catch (error) {
        console.log(chalk.yellow("⚠️  Prettier not available or failed"));
      }
    } catch (error) {
      console.log(chalk.yellow("\n⚠️  Some formatting tools failed, but code was generated\n"));
    }
  }

  // Final summary
  const summary = generator.getSummary();
  console.log(chalk.green("\n✅ Code generation completed!\n"));

  console.log(chalk.blue("📁 Generated files:"));
  for (const file of summary.filesWritten) {
    console.log(chalk.gray(`  + ${path.relative(cwd, file)}`));
  }

  if (summary.filesUpdated.length > 0) {
    console.log(chalk.blue("\n📝 Updated files:"));
    for (const file of summary.filesUpdated) {
      console.log(chalk.gray(`  ~ ${path.relative(cwd, file)}`));
    }
  }

  console.log();
  console.log(chalk.cyan("💡 Next steps:"));
  console.log(`  1. Review generated code in: src/modules/${plan.module}`);
  console.log(`  2. Update API client imports in composables (see TODO comments)`);
  console.log(`  3. Register module in src/main.ts if not auto-registered`);
  console.log(`  4. Run: pnpm dev`);
  console.log();
}

