import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Planner, generatePromptTemplate } from "../core/planner.js";
import { getValidator } from "../core/validator.js";

export interface PlanOptions {
  fromPrompt?: string;
  output?: string;
  module?: string;
}

export async function planCommand(options: PlanOptions): Promise<void> {
  const { fromPrompt, output = "./__ai/ui-plan.json", module } = options;

  if (!fromPrompt) {
    console.log(chalk.yellow("\n📝 No prompt provided. Here's a template to help you:\n"));
    console.log(generatePromptTemplate());
    console.log(
      chalk.cyan("\nUsage: vcgen plan --from-prompt \"Your UI description here\"\n")
    );
    return;
  }

  console.log(chalk.cyan("\n🤖 Generating UI-Plan from prompt...\n"));
  console.log(chalk.gray(`Prompt: "${fromPrompt}"\n`));

  // Generate plan
  const planner = new Planner();
  const plan = planner.generatePlan({ prompt: fromPrompt, module });

  // Validate generated plan
  const validator = getValidator();
  const result = validator.validateUIPlan(plan);

  if (!result.valid) {
    console.log(chalk.red("❌ Generated plan has validation errors:\n"));
    for (const error of result.errors.filter((e) => e.severity === "error")) {
      console.log(chalk.red(`  ${error.path}: ${error.message}`));
    }
    console.log();
    throw new Error("Generated plan is invalid");
  }

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write plan to file
  fs.writeFileSync(output, JSON.stringify(plan, null, 2) + "\n", "utf-8");

  console.log(chalk.green(`✅ UI-Plan generated: ${output}\n`));

  // Show summary
  console.log(chalk.blue("📋 Summary:"));
  console.log(`  Module: ${plan.module}`);
  console.log(`  Blades: ${plan.blades.length}`);

  for (const blade of plan.blades) {
    console.log(`    - ${blade.id} (${blade.layout})`);
    if (blade.components) {
      console.log(`      Components: ${blade.components.length}`);
    }
  }

  console.log();
  console.log(chalk.cyan("💡 Next steps:"));
  console.log(`  1. Review the generated plan: ${output}`);
  console.log(`  2. Edit if needed`);
  console.log(`  3. Generate code: vcgen generate --plan ${output} --fix --story`);
  console.log();

  // Show warnings if any
  const warnings = result.errors.filter((e) => e.severity === "warning");
  if (warnings.length > 0) {
    console.log(chalk.yellow(`⚠️  ${warnings.length} warning(s):\n`));
    for (const warning of warnings) {
      console.log(chalk.yellow(`  ${warning.path}: ${warning.message}`));
    }
    console.log();
  }
}

