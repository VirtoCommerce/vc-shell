import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { getValidator } from "../core/validator.js";

export interface ValidateOptions {
  plan: string;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  const { plan: planPath } = options;

  console.log(chalk.cyan("\n🔍 Validating UI-Plan...\n"));

  // Check if file exists
  if (!fs.existsSync(planPath)) {
    throw new Error(`UI-Plan file not found: ${planPath}`);
  }

  // Read and parse plan
  let plan: unknown;
  try {
    const content = fs.readFileSync(planPath, "utf-8");
    plan = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to parse UI-Plan JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate plan
  const validator = getValidator();
  const result = validator.validateUIPlan(plan);

  // Display results
  if (result.valid) {
    console.log(chalk.green("✅ UI-Plan is valid!\n"));

    // Show warnings if any
    const warnings = result.errors.filter((e) => e.severity === "warning");
    if (warnings.length > 0) {
      console.log(chalk.yellow(`⚠️  ${warnings.length} warning(s):\n`));
      for (const warning of warnings) {
        console.log(chalk.yellow(`  ${warning.path}: ${warning.message}`));
      }
      console.log();
    }

    // Show summary
    const typedPlan = plan as any;
    console.log(chalk.blue("📋 Summary:"));
    console.log(`  Module: ${typedPlan.module}`);
    console.log(`  Blades: ${typedPlan.blades?.length || 0}`);

    if (typedPlan.blades) {
      for (const blade of typedPlan.blades) {
        console.log(`    - ${blade.id} (${blade.layout})`);
      }
    }
    console.log();
  } else {
    console.log(chalk.red("❌ UI-Plan validation failed!\n"));

    const errors = result.errors.filter((e) => e.severity === "error");
    const warnings = result.errors.filter((e) => e.severity === "warning");

    if (errors.length > 0) {
      console.log(chalk.red(`${errors.length} error(s):\n`));
      for (const error of errors) {
        console.log(chalk.red(`  ${error.path}: ${error.message}`));
      }
      console.log();
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`${warnings.length} warning(s):\n`));
      for (const warning of warnings) {
        console.log(chalk.yellow(`  ${warning.path}: ${warning.message}`));
      }
      console.log();
    }

    throw new Error("Validation failed");
  }
}

