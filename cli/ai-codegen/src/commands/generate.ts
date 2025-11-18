import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { getValidator, type UIPlan } from "../core/validator.js";
import { UnifiedCodeGenerator, type GeneratedModule } from "../core/unified-generator.js";

const execAsync = promisify(exec);

export interface GenerateOptions {
  plan: string;
  dryRun?: boolean;
  fix?: boolean;
  checkTypes?: boolean;
  cwd?: string;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const {
    plan: planPath,
    dryRun = false,
    fix = false,
    checkTypes = true,
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
  const generator = new UnifiedCodeGenerator();
  let generationResult: GeneratedModule;

  try {
    generationResult = await generator.generateModule(plan, cwd, {
      writeToDisk: !dryRun,
      dryRun,
    });
  } catch (error) {
    console.error(chalk.red("\n❌ Code generation failed:"));
    throw error;
  }

  if (dryRun) {
    console.log(chalk.blue("📁 Planned files:"));
    for (const file of generationResult.files) {
      console.log(chalk.gray(`  • ${path.relative(cwd, file.path)}`));
    }
    console.log(chalk.yellow("\n🔍 Dry run completed - no files were written"));
    return;
  }

  // Run type checking if requested
  if (checkTypes && !dryRun) {
    console.log(chalk.cyan("\n🔍 Checking TypeScript types...\n"));

    try {
      // Try to run vue-tsc
      try {
        const { stdout, stderr } = await execAsync(`npx vue-tsc --noEmit`, { cwd });
        if (stderr && !stderr.includes("Found 0 errors")) {
          console.log(chalk.yellow("⚠️  Type checking found issues:"));
          console.log(chalk.yellow(stderr));
        } else {
          console.log(chalk.green("✓ Type checking passed"));
        }
      } catch (error: any) {
        if (error.stdout || error.stderr) {
          const output = (error.stdout || error.stderr) as string;
          if (output.includes("Found 0 errors")) {
            console.log(chalk.green("✓ Type checking passed"));
          } else {
            console.log(chalk.red("❌ Type checking found errors:"));
            console.log(chalk.red(output));
            console.log(chalk.yellow("\n⚠️  Please fix type errors before running the application"));
          }
        } else {
          console.log(chalk.yellow("⚠️  vue-tsc not available or failed to run"));
        }
      }
    } catch (error) {
      console.log(chalk.yellow("⚠️  Type checking failed, but code was generated"));
    }
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
  console.log(chalk.green("\n✅ Code generation completed!\n"));

  console.log(chalk.blue("📁 Generated files:"));
  for (const file of generationResult.files) {
    console.log(chalk.gray(`  + ${path.relative(cwd, file.path)}`));
  }

  console.log();
  console.log(chalk.cyan("💡 Next steps:"));
  console.log(`  1. Review generated code in: src/modules/${plan.module}`);
  console.log(`  2. Update API client imports in composables (see TODO comments)`);
  console.log(`  3. Register module in src/main.ts if not auto-registered`);
  console.log(`  4. Run: pnpm dev`);
  console.log();
}
