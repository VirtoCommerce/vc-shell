/**
 * Submit Step Executor
 *
 * Validates and saves generated code.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * SubmitStepExecutor
 *
 * Step 6: Submit and validate generated code.
 */
export class SubmitStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: {
      bladeId: string;
      code: string;
      cwd?: string;
      composable?: { name: string; code: string };
      apiClient?: { name: string; code: string };
    },
  ): Promise<StepResult> {
    const { bladeId, code, cwd, composable, apiClient } = input;

    try {
      console.log(`[SubmitStep] Validating code for blade: ${bladeId}`);

      // Basic validation
      const errors: string[] = [];

      // Check code is not empty
      if (!code || code.trim().length === 0) {
        errors.push("Code is empty");
      }

      // Check code contains Vue SFC structure
      if (!code.includes("<template>") || !code.includes("<script")) {
        errors.push("Invalid Vue SFC structure");
      }

      // Check code uses Composition API
      if (!code.includes("setup") && !code.includes("<script setup")) {
        errors.push("Must use Vue 3 Composition API");
      }

      if (errors.length > 0) {
        console.error(`[SubmitStep] ✗ Validation failed: ${errors.length} errors`);
        return {
          success: false,
          errors,
        };
      }

      // Save code if cwd provided
      if (cwd) {
        console.log(`[SubmitStep] Saving code to: ${cwd}`);

        const fs = await import("node:fs");
        const path = await import("node:path");

        const plan = state.plan;
        if (!plan) {
          return {
            success: false,
            errors: ["No plan found in state"],
          };
        }

        // Create blade file
        const bladePath = path.join(
          cwd,
          "src",
          "modules",
          plan.module,
          "pages",
          `${bladeId}.vue`,
        );

        const dir = path.dirname(bladePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(bladePath, code, "utf-8");
        console.log(`[SubmitStep] ✓ Saved blade: ${bladePath}`);

        // Save composable if provided
        if (composable) {
          const composablePath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "composables",
            composable.name,
          );

          const composableDir = path.dirname(composablePath);
          if (!fs.existsSync(composableDir)) {
            fs.mkdirSync(composableDir, { recursive: true });
          }

          fs.writeFileSync(composablePath, composable.code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved composable: ${composablePath}`);
        }

        // Save API client if provided
        if (apiClient) {
          const clientPath = path.join(
            cwd,
            "src",
            "modules",
            plan.module,
            "api",
            apiClient.name,
          );

          const clientDir = path.dirname(clientPath);
          if (!fs.existsSync(clientDir)) {
            fs.mkdirSync(clientDir, { recursive: true });
          }

          fs.writeFileSync(clientPath, apiClient.code, "utf-8");
          console.log(`[SubmitStep] ✓ Saved API client: ${clientPath}`);
        }
      }

      console.log(`[SubmitStep] ✓ Code validated and saved successfully`);

      return {
        success: true,
        data: {},
        nextStep: "completed" as any,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Submit failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute if we have generation guides
    return (
      !!state.generationGuides &&
      (state.currentStep === ("generating" as any) ||
        state.currentStep === ("submitting" as any))
    );
  }

  getRequiredInput(): string[] {
    return ["bladeId", "code"];
  }
}
